// ============================================================
// IndicParlerTTSEngine.h
// Native C++ Adapter Interface for AI4Bharat Indic Parler-TTS.
//
// Model Identification:
//   Repository: https://huggingface.co/ai4bharat/indic-parler-tts
//   Pretrained: https://huggingface.co/ai4bharat/indic-parler-tts-pretrained
//   License: Apache 2.0
//   Languages: Santali (sat), Hindi (hi), and 19 other Indic languages
//   Santali Training Data: 298.19 hours (148,184 utterances)
//
// Hardware & Mobile Runtime Analysis:
//   - Parameter Count: 937,803,241 (~938M parameters)
//   - Weight Size: ~1.88 GB (FP16) / ~3.75 GB (FP32)
//   - Memory Footprint: > 3.0 GB RAM required during autoregressive generation
//   - Target Hardware: Low-end Android tablets (~2 GB total system RAM)
//   - Janbhasha App Memory Budget: 600 MB total resident, 400 MB model peak
//   - Mobile Compatibility: BLOCKED. Parler-TTS autoregressive architecture
//     (T5 encoder + causal audio decoder + DAC vocoder) lacks official ONNX
//     export or mobile C++ inference runtime. Loading this model on a 2 GB
//     device triggers immediate Android LMK (Low Memory Killer) OOM crash.
//
// Adapter Purpose:
//   Fulfills ITTSEngine contract to decouple the React Native / JSI pipeline
//   from model-specific runtime changes. Allows future drop-in of quantized
//   or mobile-optimized Parler-TTS backends without modifying frontend code.
// ============================================================
#pragma once

#include "ITTSEngine.h"
#include <string>
#include <unordered_set>
#include <atomic>
#include <memory>

namespace janbhasha {

class IndicParlerTTSEngine final : public ITTSEngine {
public:
    IndicParlerTTSEngine();
    ~IndicParlerTTSEngine() override;

    void initialize(const std::string& modelPath) override;

    TTSSynthesisResult synthesize(const TTSInput& input,
                                   const std::string& outputPath) override;

    bool supportsLanguage(const std::string& langCode) const override;

    void release() override;
    bool isInitialized() const override { return initialized_.load(); }
    std::string engineName() const override { return "IndicParlerTTSEngine/AI4Bharat"; }
    uint32_t sampleRate() const { return sampleRate_; }

private:
    std::string modelPath_;
    std::atomic<bool> initialized_{false};
    std::unordered_set<std::string> supportedLanguages_;
    uint32_t sampleRate_ = 44100; // Parler-TTS DAC vocoder outputs 44.1 kHz
};

} // namespace janbhasha
