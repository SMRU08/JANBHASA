// ============================================================
// VITSTTSEngine.h
// VITS ONNX Runtime adapter for offline TTS.
// FP32 ONLY — VITS normalizing flow is numerically unstable in INT8.
// ============================================================
#pragma once

#include "ITTSEngine.h"
#include <string>
#include <unordered_set>
#include <atomic>
#include <memory>

namespace janbhasha {

/**
 * VITSTTSEngine
 *
 * Wraps ONNX Runtime for VITS (facebook/mms-tts-*) inference.
 *
 * Model directory layout:
 *   <modelPath>/
 *     model.onnx           (VITS ONNX export — FP32)
 *     tokenizer.json       (character-level tokenizer)
 *     config.json          (speaker IDs, sample rate)
 *
 * Audio output: 16kHz, mono, 32-bit float PCM → WAV with RIFF header.
 *
 * IMPORTANT: Do NOT quantize this model to INT8. The normalizing flow
 * uses tanh activations that are numerically unstable under INT8 quantization.
 * Use FP32 exclusively for TTS inference.
 */
class VITSTTSEngine final : public ITTSEngine {
public:
    VITSTTSEngine() = default;
    ~VITSTTSEngine() override;

    void initialize(const std::string& modelPath) override;

    TTSSynthesisResult synthesize(const TTSInput& input,
                                   const std::string& outputPath) override;

    void addSupportedLanguage(const std::string& langCode);

    bool supportsLanguage(const std::string& langCode) const override;

    void release() override;
    bool isInitialized() const override { return initialized_.load(); }
    std::string engineName() const override { return "VITSTTSEngine/ONNX"; }

private:
    // Tokenize text to integer IDs using character-level tokenizer.
    std::vector<int64_t> tokenize(const std::string& text,
                                   const std::string& langCode) const;

    // Write float32 PCM samples to WAV file with RIFF header.
    static bool writeWavFile(const std::string& path,
                              const std::vector<float>& samples,
                              uint32_t sampleRate);

    std::string modelPath_;
    std::atomic<bool> initialized_{false};
    std::unordered_set<std::string> supportedLanguages_;

    // ONNX Runtime session — heap-allocated, void* to avoid header pollution.
    void* ortEnv_     = nullptr;
    void* ortSession_ = nullptr;

    uint32_t modelSampleRate_ = 16000;

    static constexpr uint32_t DEFAULT_SAMPLE_RATE = 16000;
};

} // namespace janbhasha
