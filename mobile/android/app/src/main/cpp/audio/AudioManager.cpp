// ============================================================
// AudioManager.cpp
// AAudio recording + playback implementation.
// ============================================================
#include "AudioManager.h"

#include <fstream>
#include <cstring>
#include <cstdio>
#include <chrono>
#include <android/log.h>

#define LOG_TAG "JanbhashaAudio"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO,  LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

namespace janbhasha {

// ---- Destructor ----------------------------------------------------

AudioManager::~AudioManager() {
    if (recording_.load()) {
        // Emergency stop — suppress exceptions in destructor
        try { recording_.store(false); } catch (...) {}
    }
    if (recordStream_) {
        AAudioStream_close(recordStream_);
        recordStream_ = nullptr;
    }
    if (playbackStream_) {
        AAudioStream_close(playbackStream_);
        playbackStream_ = nullptr;
    }
}

// ---- WAV writer (static) -------------------------------------------

bool AudioManager::writePcmToWav(const std::string& path,
                                   const std::vector<int16_t>& pcm,
                                   int32_t sampleRate,
                                   int16_t numChannels) {
    std::ofstream f(path, std::ios::binary | std::ios::trunc);
    if (!f.is_open()) return false;

    uint32_t dataSize    = static_cast<uint32_t>(pcm.size()) * sizeof(int16_t);
    uint32_t chunkSize   = 36 + dataSize;
    uint16_t audioFmt    = 1; // PCM
    uint32_t byteRate    = static_cast<uint32_t>(sampleRate) * numChannels * 2;
    uint16_t blockAlign  = static_cast<uint16_t>(numChannels * 2);
    uint16_t bitsPerSamp = 16;

    f.write("RIFF", 4);
    f.write(reinterpret_cast<const char*>(&chunkSize), 4);
    f.write("WAVE", 4);
    f.write("fmt ", 4);
    uint32_t sub1 = 16;
    f.write(reinterpret_cast<const char*>(&sub1), 4);
    f.write(reinterpret_cast<const char*>(&audioFmt), 2);
    f.write(reinterpret_cast<const char*>(&numChannels), 2);
    f.write(reinterpret_cast<const char*>(&sampleRate), 4);
    f.write(reinterpret_cast<const char*>(&byteRate), 4);
    f.write(reinterpret_cast<const char*>(&blockAlign), 2);
    f.write(reinterpret_cast<const char*>(&bitsPerSamp), 2);
    f.write("data", 4);
    f.write(reinterpret_cast<const char*>(&dataSize), 4);
    f.write(reinterpret_cast<const char*>(pcm.data()), dataSize);
    return static_cast<bool>(f);
}

// ---- AAudio recording callback (real-time thread) ------------------

aaudio_data_callback_result_t AudioManager::recordCallback(
    AAudioStream* /*stream*/, void* userData,
    void* audioData, int32_t numFrames)
{
    auto* self = static_cast<AudioManager*>(userData);
    if (!self->recording_.load()) return AAUDIO_CALLBACK_RESULT_STOP;

    const int16_t* frames = static_cast<const int16_t*>(audioData);
    {
        std::lock_guard<std::mutex> lock(self->recordMutex_);
        size_t remaining = MAX_RECORD_SAMPLES - self->recordBuffer_.size();
        size_t toAppend  = std::min(static_cast<size_t>(numFrames), remaining);
        self->recordBuffer_.insert(self->recordBuffer_.end(),
                                   frames, frames + toAppend);
        if (self->recordBuffer_.size() >= MAX_RECORD_SAMPLES) {
            return AAUDIO_CALLBACK_RESULT_STOP;
        }
    }
    return AAUDIO_CALLBACK_RESULT_CONTINUE;
}

// ---- AAudio playback callback (real-time thread) -------------------

aaudio_data_callback_result_t AudioManager::playbackCallback(
    AAudioStream* /*stream*/, void* userData,
    void* audioData, int32_t numFrames)
{
    auto* self = static_cast<AudioManager*>(userData);
    int16_t* out = static_cast<int16_t*>(audioData);

    size_t pos = self->playPosition_.load(std::memory_order_relaxed);
    size_t available = (pos < self->playBuffer_.size())
                     ? (self->playBuffer_.size() - pos) : 0;
    size_t toCopy = std::min(static_cast<size_t>(numFrames), available);

    if (toCopy > 0) {
        memcpy(out, self->playBuffer_.data() + pos, toCopy * sizeof(int16_t));
        self->playPosition_.store(pos + toCopy, std::memory_order_relaxed);
    }
    if (toCopy < static_cast<size_t>(numFrames)) {
        memset(out + toCopy, 0, (numFrames - toCopy) * sizeof(int16_t));
        self->playing_.store(false);
        return AAUDIO_CALLBACK_RESULT_STOP;
    }
    return AAUDIO_CALLBACK_RESULT_CONTINUE;
}

// ---- Recording implementation --------------------------------------

void AudioManager::initRecording(const AudioRecordingConfig& config) {
    recordConfig_ = config;

    AAudioStreamBuilder* builder = nullptr;
    aaudio_result_t res = AAudio_createStreamBuilder(&builder);
    throwIf(res != AAUDIO_OK, ErrorCode::AUDIO_RECORD_INIT_FAILED,
            "AAudio_createStreamBuilder failed: " + std::to_string(res));

    AAudioStreamBuilder_setDirection(builder, AAUDIO_DIRECTION_INPUT);
    AAudioStreamBuilder_setSampleRate(builder, config.sampleRate);
    AAudioStreamBuilder_setChannelCount(builder, config.channelCount);
    AAudioStreamBuilder_setFormat(builder, AAUDIO_FORMAT_PCM_I16);
    AAudioStreamBuilder_setFramesPerDataCallback(builder, config.framesPerBurst);
    AAudioStreamBuilder_setDataCallback(builder, recordCallback, this);
    AAudioStreamBuilder_setPerformanceMode(builder, AAUDIO_PERFORMANCE_MODE_LOW_LATENCY);
    AAudioStreamBuilder_setSharingMode(builder, AAUDIO_SHARING_MODE_EXCLUSIVE);

    if (recordStream_) {
        AAudioStream_close(recordStream_);
        recordStream_ = nullptr;
    }

    res = AAudioStreamBuilder_openStream(builder, &recordStream_);
    AAudioStreamBuilder_delete(builder);

    throwIf(res != AAUDIO_OK || !recordStream_,
            ErrorCode::AUDIO_RECORD_INIT_FAILED,
            "AAudioStreamBuilder_openStream failed: " + std::to_string(res));

    LOGI("AudioManager: recording stream opened (%d Hz, %d ch)",
         config.sampleRate, config.channelCount);
}

void AudioManager::startRecording() {
    throwIf(!recordStream_, ErrorCode::AUDIO_RECORD_INIT_FAILED,
            "Recording stream not initialized. Call initRecording() first.");

    {
        std::lock_guard<std::mutex> lock(recordMutex_);
        recordBuffer_.clear();
        recordBuffer_.reserve(MAX_RECORD_SAMPLES);
    }

    recording_.store(true);
    aaudio_result_t res = AAudioStream_requestStart(recordStream_);
    throwIf(res != AAUDIO_OK, ErrorCode::AUDIO_RECORD_START_FAILED,
            "AAudioStream_requestStart failed: " + std::to_string(res));

    LOGI("AudioManager: recording started");
}

std::string AudioManager::stopRecording(const std::string& outputDir) {
    if (!recording_.load()) return {};

    recording_.store(false);
    aaudio_result_t res = AAudioStream_requestStop(recordStream_);
    throwIf(res != AAUDIO_OK, ErrorCode::AUDIO_RECORD_STOP_FAILED,
            "AAudioStream_requestStop failed: " + std::to_string(res));

    // Wait for stream to stop
    aaudio_stream_state_t state = AAUDIO_STREAM_STATE_STOPPING;
    AAudioStream_waitForStateChange(recordStream_, AAUDIO_STREAM_STATE_STOPPING,
                                    &state, 1'000'000'000LL /*1s*/);

    // Capture buffer
    std::vector<int16_t> captured;
    {
        std::lock_guard<std::mutex> lock(recordMutex_);
        captured = std::move(recordBuffer_);
    }

    // Write WAV
    char fname[256];
    auto now = std::chrono::system_clock::now().time_since_epoch().count();
    snprintf(fname, sizeof(fname), "%s/rec_%lld.wav", outputDir.c_str(),
             static_cast<long long>(now));

    bool ok = writePcmToWav(fname, captured, recordConfig_.sampleRate, 1);
    throwIf(!ok, ErrorCode::AUDIO_FILE_WRITE_FAILED,
            "Failed to write recording: " + std::string(fname));

    LOGI("AudioManager: saved recording to %s (%zu samples)", fname, captured.size());
    return std::string(fname);
}

// ---- Playback implementation ----------------------------------------

void AudioManager::playFile(const std::string& wavPath,
                             const AudioPlaybackConfig& config) {
    // Load WAV (skip 44-byte RIFF header, read PCM-16 data)
    std::ifstream f(wavPath, std::ios::binary);
    throwIf(!f.is_open(), ErrorCode::AUDIO_PLAYBACK_FAILED,
            "Cannot open WAV for playback: " + wavPath);

    f.seekg(44); // skip RIFF header
    std::vector<int16_t> pcm(std::istreambuf_iterator<char>(f), {});
    // Reinterpret bytes as int16_t
    playBuffer_.resize(pcm.size() / sizeof(int16_t));
    memcpy(playBuffer_.data(), pcm.data(), playBuffer_.size() * sizeof(int16_t));
    playPosition_.store(0);

    // Build output stream
    AAudioStreamBuilder* builder = nullptr;
    AAudio_createStreamBuilder(&builder);
    AAudioStreamBuilder_setDirection(builder, AAUDIO_DIRECTION_OUTPUT);
    AAudioStreamBuilder_setSampleRate(builder, config.sampleRate);
    AAudioStreamBuilder_setChannelCount(builder, config.channelCount);
    AAudioStreamBuilder_setFormat(builder, AAUDIO_FORMAT_PCM_I16);
    AAudioStreamBuilder_setDataCallback(builder, playbackCallback, this);
    AAudioStreamBuilder_setPerformanceMode(builder, AAUDIO_PERFORMANCE_MODE_LOW_LATENCY);

    if (playbackStream_) {
        AAudioStream_close(playbackStream_);
        playbackStream_ = nullptr;
    }

    aaudio_result_t res = AAudioStreamBuilder_openStream(builder, &playbackStream_);
    AAudioStreamBuilder_delete(builder);
    throwIf(res != AAUDIO_OK, ErrorCode::AUDIO_PLAYBACK_FAILED,
            "AAudioStreamBuilder_openStream (playback) failed: " + std::to_string(res));

    playing_.store(true);
    AAudioStream_requestStart(playbackStream_);

    // Block until playback completes
    while (playing_.load()) {
        std::this_thread::sleep_for(std::chrono::milliseconds(10));
    }
    AAudioStream_requestStop(playbackStream_);
    LOGI("AudioManager: playback complete");
}

void AudioManager::stopPlayback() {
    playing_.store(false);
    if (playbackStream_) {
        AAudioStream_requestStop(playbackStream_);
    }
}

} // namespace janbhasha
