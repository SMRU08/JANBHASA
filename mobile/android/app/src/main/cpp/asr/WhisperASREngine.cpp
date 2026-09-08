// ============================================================
// WhisperASREngine.cpp
// CTranslate2 Whisper inference — CPU INT8, no GPU dependency.
// ============================================================
#include "WhisperASREngine.h"
#include "../errors/JanbhashaErrors.h"

#ifdef HAVE_CTRANSLATE2
#include <ctranslate2/translator.h>
#include <ctranslate2/whisper.h>
#endif

#include <fstream>
#include <vector>
#include <cstring>
#include <cstdint>
#include <chrono>
#include <stdexcept>
#include <android/log.h>

#define LOG_TAG "JanbhashaASR"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO,  LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

namespace janbhasha {

WhisperASREngine::~WhisperASREngine() {
    release();
}

void WhisperASREngine::initialize(const std::string& modelPath,
                                   const std::string& languageHint) {
    throwIf(initialized_.load(), ErrorCode::MODEL_ALREADY_LOADED,
            "WhisperASREngine already initialized. Call release() first.");

    modelPath_    = modelPath;
    languageHint_ = languageHint;

    LOGI("WhisperASREngine: loading model from %s", modelPath.c_str());

    std::ifstream check(modelPath + "/model.bin");
    throwIf(!check.is_open(), ErrorCode::MODEL_NOT_FOUND,
            "Whisper model binary not found: " + modelPath + "/model.bin");
    check.close();

#ifdef HAVE_CTRANSLATE2
    try {
        ctranslate2::models::ModelLoader loader(modelPath);
        loader.device = ctranslate2::Device::CPU;
        loader.compute_type = ctranslate2::ComputeType::INT8;
        auto* model = new ctranslate2::Whisper(loader);
        whisperModel_ = static_cast<void*>(model);
        LOGI("WhisperASREngine: CTranslate2 native model instantiated");
    } catch (const std::exception& e) {
        throw JanbhashaError(ErrorCode::MODEL_LOAD_FAILED,
            "Failed to load CTranslate2 Whisper model: " + std::string(e.what()));
    }
#else
    LOGI("WhisperASREngine: compiled in stub mode (place libctranslate2.so in android/app/libs to enable)");
#endif

    initialized_.store(true);
    LOGI("WhisperASREngine: initialized OK (model_path=%s)", modelPath.c_str());
}

std::vector<float> WhisperASREngine::pcmToFloat32(const std::vector<uint8_t>& pcmBytes) {
    // PCM: signed 16-bit LE interleaved → float32 [-1, 1]
    size_t numSamples = pcmBytes.size() / 2;
    std::vector<float> samples(numSamples);
    for (size_t i = 0; i < numSamples; ++i) {
        int16_t sample = static_cast<int16_t>(
            (static_cast<uint16_t>(pcmBytes[i * 2 + 1]) << 8) |
             static_cast<uint16_t>(pcmBytes[i * 2]));
        samples[i] = static_cast<float>(sample) / 32768.0f;
    }
    return samples;
}

std::vector<uint8_t> WhisperASREngine::loadWavFile(const std::string& path) {
    std::ifstream f(path, std::ios::binary);
    throwIf(!f.is_open(), ErrorCode::MODEL_NOT_FOUND,
            "Audio file not found: " + path);

    // Read RIFF header — 44 bytes standard WAV
    uint8_t header[44];
    f.read(reinterpret_cast<char*>(header), 44);
    throwIf(!f, ErrorCode::AUDIO_FORMAT_UNSUPPORTED,
            "WAV file too short or corrupt: " + path);

    // Validate RIFF magic
    throwIf(memcmp(header, "RIFF", 4) != 0, ErrorCode::AUDIO_FORMAT_UNSUPPORTED,
            "Not a RIFF/WAV file: " + path);
    throwIf(memcmp(header + 8, "WAVE", 4) != 0, ErrorCode::AUDIO_FORMAT_UNSUPPORTED,
            "Not a WAVE chunk: " + path);

    // Sample rate check (bytes 24-27, little-endian)
    uint32_t sampleRate = 
        header[24] | (header[25] << 8) | (header[26] << 16) | (header[27] << 24);
    throwIf(sampleRate != 16000, ErrorCode::AUDIO_FORMAT_UNSUPPORTED,
            "WAV sample rate must be 16000 Hz, got " + std::to_string(sampleRate));

    // Read PCM data
    std::vector<uint8_t> pcm(std::istreambuf_iterator<char>(f), {});
    return pcm;
}

ASRResult WhisperASREngine::transcribe(const std::vector<uint8_t>& audioData,
                                        const std::string& languageHint) {
    throwIf(!initialized_.load(), ErrorCode::NOT_INITIALIZED,
            "WhisperASREngine not initialized");
    throwIf(audioData.empty(), ErrorCode::ASR_EMPTY_AUDIO,
            "Audio buffer is empty");

    int numSamples = static_cast<int>(audioData.size() / 2);
    throwIf(numSamples < MIN_AUDIO_SAMPLES, ErrorCode::ASR_AUDIO_TOO_SHORT,
            "Audio too short: " + std::to_string(numSamples) +
            " samples (minimum " + std::to_string(MIN_AUDIO_SAMPLES) + ")");

    auto t0 = std::chrono::steady_clock::now();

    std::vector<float> samples = pcmToFloat32(audioData);

    // ---- CTranslate2 Inference (uncomment when CTranslate2 is linked) ----
    // auto* model = static_cast<ctranslate2::Whisper*>(whisperModel_);
    // ctranslate2::WhisperOptions opts;
    // opts.language = languageHint.empty() ? "hi" : languageHint;
    // opts.task = ctranslate2::WhisperTask::Transcribe;
    // opts.no_speech_threshold = 0.6f;
    // opts.compression_ratio_threshold = 2.4f;
    // auto result = model->align(samples, opts);
    // std::string transcript;
    // for (const auto& seg : result.segments) transcript += seg.text;
    //
    // ASRResult out;
#ifdef HAVE_CTRANSLATE2
    auto* model = static_cast<ctranslate2::Whisper*>(whisperModel_);
    ctranslate2::WhisperOptions opts;
    opts.language = languageHint.empty() ? "hi" : languageHint;
    opts.task = ctranslate2::WhisperTask::Transcribe;
    opts.no_speech_threshold = 0.6f;
    opts.compression_ratio_threshold = 2.4f;
    auto ct2Result = model->align(samples, opts);
    std::string transcript;
    for (const auto& seg : ct2Result.segments) transcript += seg.text;

    ASRResult result;
    result.transcript       = transcript;
    result.detectedLanguage = languageHint;
    result.confidence       = 0.9f;
    result.durationMs       = static_cast<int64_t>(numSamples) * 1000 / SAMPLE_RATE;
    return result;
#else
    // Development stub — returns placeholder until prebuilt libctranslate2.so is linked.
    auto t1 = std::chrono::steady_clock::now();
    int64_t latencyMs = std::chrono::duration_cast<std::chrono::milliseconds>(t1 - t0).count();

    LOGI("WhisperASREngine: transcribe() called in stub mode, %d samples, lang=%s",
         numSamples, languageHint.c_str());

    ASRResult result;
    result.transcript       = "[ASR_PLACEHOLDER — link CTranslate2 to enable]";
    result.detectedLanguage = languageHint;
    result.confidence       = 0.0f;
    result.durationMs       = static_cast<int64_t>(numSamples) * 1000 / SAMPLE_RATE;
    return result;
#endif
}

ASRResult WhisperASREngine::transcribeFile(const std::string& filePath,
                                            const std::string& languageHint) {
    auto pcm = loadWavFile(filePath);
    return transcribe(pcm, languageHint);
}

void WhisperASREngine::release() {
    if (!initialized_.load()) return;

#ifdef HAVE_CTRANSLATE2
    if (whisperModel_) {
        delete static_cast<ctranslate2::Whisper*>(whisperModel_);
        whisperModel_ = nullptr;
    }
#endif

    initialized_.store(false);
    LOGI("WhisperASREngine: released");
}

} // namespace janbhasha
