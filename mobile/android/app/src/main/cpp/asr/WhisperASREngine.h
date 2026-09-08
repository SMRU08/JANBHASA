// ============================================================
// WhisperASREngine.h
// CTranslate2-based Whisper adapter for offline ASR.
// ============================================================
#pragma once

#include "IASREngine.h"
#include <string>
#include <vector>
#include <memory>
#include <atomic>

// Forward-declare CTranslate2 types to avoid heavy includes in header.
// The actual ct2 headers are included in WhisperASREngine.cpp.
namespace ctranslate2 {
    class Whisper;
}

namespace janbhasha {

/**
 * WhisperASREngine
 *
 * Wraps CTranslate2's Whisper inference for CPU INT8.
 *
 * Model requirements on device:
 *   /data/user/0/com.janbhasha/files/models/asr/
 *     model.bin          (CTranslate2 INT8 model)
 *     vocabulary.json    (Whisper token vocab)
 *
 * Audio requirements:
 *   16kHz, mono, signed 16-bit PCM (little-endian)
 *
 * THREAD SAFETY: transcribe() and transcribeFile() are re-entrant
 * IF separate WhisperASREngine instances are used per thread. A single
 * instance is NOT thread-safe — the PipelineManager ensures serialized access.
 */
class WhisperASREngine final : public IASREngine {
public:
    WhisperASREngine() = default;
    ~WhisperASREngine() override;

    // IASREngine
    void initialize(const std::string& modelPath,
                    const std::string& languageHint = "hi") override;

    ASRResult transcribe(const std::vector<uint8_t>& audioData,
                         const std::string& languageHint = "hi") override;

    ASRResult transcribeFile(const std::string& filePath,
                             const std::string& languageHint = "hi") override;

    void release() override;
    bool isInitialized() const override { return initialized_.load(); }
    std::string engineName() const override { return "WhisperASREngine/CTranslate2"; }

private:
    // Convert raw PCM bytes to float32 samples normalized to [-1, 1]
    static std::vector<float> pcmToFloat32(const std::vector<uint8_t>& pcmBytes);

    // Load WAV file from disk into PCM bytes, validating header.
    static std::vector<uint8_t> loadWavFile(const std::string& path);

    std::string modelPath_;
    std::string languageHint_;
    std::atomic<bool> initialized_{false};

    // CTranslate2 Whisper model — heap-allocated to avoid header pollution.
    // Wrapped in void* and cast internally to keep header clean.
    void* whisperModel_ = nullptr;

    static constexpr int SAMPLE_RATE = 16000;
    static constexpr int MIN_AUDIO_SAMPLES = 1600; // 100 ms minimum
};

} // namespace janbhasha
