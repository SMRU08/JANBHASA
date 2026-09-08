// ============================================================
// AudioManager.h
// AAudio (Android 8.0+) recording and playback for Janbhasha.
// Rationale: AAudio chosen over Oboe for direct SDK dependency;
//            over AudioRecord JNI to eliminate JNI overhead on the
//            hot recording path. Oboe wraps AAudio anyway and adds
//            ~20ms initialization overhead from JNI bridge.
// ============================================================
#pragma once

#include "../errors/JanbhashaErrors.h"
#include <string>
#include <vector>
#include <cstdint>
#include <atomic>
#include <mutex>
#include <thread>
#include <functional>
#include <memory>

// AAudio — Android 8.0+ (API 26). Always present on Android 9+.
#include <aaudio/AAudio.h>

namespace janbhasha {

struct AudioRecordingConfig {
    int32_t sampleRate       = 16000;  // Hz — Whisper requires 16kHz
    int32_t channelCount     = 1;      // mono
    int32_t framesPerBurst   = 192;    // ~12ms at 16kHz
    int32_t maxDurationMs    = 30000;  // max recording: 30 seconds
};

struct AudioPlaybackConfig {
    int32_t sampleRate     = 16000;
    int32_t channelCount   = 1;
};

/**
 * AudioManager
 *
 * Handles:
 *   1. Recording: AAudio stream → PCM buffer → WAV file on disk.
 *   2. Playback:  WAV file on disk → AAudio stream.
 *
 * WHY AAudio vs Oboe vs AudioRecord:
 *   - AAudio: Direct native API, lowest latency (~10ms), no JNI, API 26+.
 *   - Oboe:   C++ wrapper over AAudio (or OpenSLES fallback). Adds value only
 *             on API < 26 (Android 8.0-), which is below our API 28 target.
 *             We do NOT need Oboe's fallback path — eliminates the dependency.
 *   - AudioRecord: Requires JNI, adds ~20ms overhead, GC pressure per callback.
 *
 * THREAD SAFETY: startRecording/stopRecording are NOT thread-safe against each
 * other. The caller (PipelineManager) serializes audio operations.
 */
class AudioManager {
public:
    using PcmCallback = std::function<void(const int16_t* frames, int32_t numFrames)>;

    AudioManager() = default;
    ~AudioManager();

    // Non-copyable
    AudioManager(const AudioManager&) = delete;
    AudioManager& operator=(const AudioManager&) = delete;

    // ---- Recording -------------------------------------------------

    // Opens an AAudio input stream. Throws JanbhashaError on failure.
    void initRecording(const AudioRecordingConfig& config = {});

    // Starts recording to an internal PCM buffer.
    void startRecording();

    // Stops recording, returns path to the written WAV file.
    // Blocks until the AAudio stream is drained.
    std::string stopRecording(const std::string& outputDir);

    bool isRecording() const { return recording_.load(); }

    // ---- Playback --------------------------------------------------

    // Play a WAV file from disk through AAudio output stream.
    // Blocks until playback completes or is cancelled.
    void playFile(const std::string& wavPath,
                  const AudioPlaybackConfig& config = {});

    // Stop in-progress playback.
    void stopPlayback();

    bool isPlaying() const { return playing_.load(); }

    // ---- Utils -----------------------------------------------------

    // Write raw PCM-16 buffer to a WAV file.
    static bool writePcmToWav(const std::string& path,
                               const std::vector<int16_t>& pcm,
                               int32_t sampleRate,
                               int16_t numChannels);

private:
    // AAudio callback — called on the AAudio real-time thread.
    static aaudio_data_callback_result_t recordCallback(
        AAudioStream* stream, void* userData,
        void* audioData, int32_t numFrames);

    static aaudio_data_callback_result_t playbackCallback(
        AAudioStream* stream, void* userData,
        void* audioData, int32_t numFrames);

    AAudioStream* recordStream_   = nullptr;
    AAudioStream* playbackStream_ = nullptr;

    AudioRecordingConfig recordConfig_;

    std::vector<int16_t> recordBuffer_;
    std::mutex recordMutex_;

    std::vector<int16_t> playBuffer_;
    std::atomic<size_t> playPosition_{0};

    std::atomic<bool> recording_{false};
    std::atomic<bool> playing_{false};

    // Max samples pre-allocated: 30s * 16000 * 2 bytes / 2 = 480,000 samples
    static constexpr size_t MAX_RECORD_SAMPLES = 480'000;
};

} // namespace janbhasha
