// ============================================================
// ITTSEngine.h
// Pure abstract interface for TTS adapters.
// ============================================================
#pragma once

#include <string>
#include <vector>
#include <cstdint>

namespace janbhasha {

struct TTSInput {
    std::string text;
    std::string language;     // BCP-47
    std::string script;       // ISO 15924
    float speakingRate = 1.0f;
    int speakerId = 0;
};

struct TTSSynthesisResult {
    std::string outputFilePath; // file URI written by the engine
    int64_t durationMs;
    uint32_t sampleRate;        // Hz
    uint16_t numChannels;
    std::vector<float> waveform; // optional — only populated if caller requests
};

/**
 * ITTSEngine — pure interface.
 * Implementors: VITSTTSEngine.
 *
 * CONTRACT:
 *  - synthesize() writes a 16kHz mono WAV to `outputPath`.
 *  - Output MUST be valid WAV with RIFF header.
 *  - Float32 audio inside ONNX is kept as float32 through the normalizing
 *    flow — do NOT quantize TTS to INT8 (numerically unstable).
 *  - release() must be idempotent.
 */
class ITTSEngine {
public:
    virtual ~ITTSEngine() = default;

    virtual void initialize(const std::string& modelPath) = 0;

    // Synthesize `input.text` → WAV file at `outputPath`.
    virtual TTSSynthesisResult synthesize(const TTSInput& input,
                                           const std::string& outputPath) = 0;

    virtual bool supportsLanguage(const std::string& langCode) const = 0;

    virtual void release() = 0;
    virtual bool isInitialized() const = 0;
    virtual std::string engineName() const = 0;
};

} // namespace janbhasha
