// ============================================================
// IASREngine.h
// Pure abstract interface for ASR adapters.
// ============================================================
#pragma once

#include <string>
#include <vector>
#include <cstdint>

namespace janbhasha {

struct ASRResult {
    std::string transcript;
    std::string detectedLanguage;  // BCP-47 code
    float confidence;              // 0.0 – 1.0
    int64_t durationMs;

    struct WordTimestamp {
        std::string word;
        int64_t startMs;
        int64_t endMs;
    };
    std::vector<WordTimestamp> wordTimestamps; // optional
};

/**
 * IASREngine — pure interface.
 * Implementors: WhisperASREngine.
 *
 * CONTRACT:
 *  - initialize() must be called once before transcribe().
 *  - transcribe() must be thread-safe (called from worker thread pool).
 *  - release() must be idempotent.
 */
class IASREngine {
public:
    virtual ~IASREngine() = default;

    // Load weights into memory. Throws JanbhashaError on failure.
    virtual void initialize(const std::string& modelPath,
                            const std::string& languageHint = "hi") = 0;

    // Transcribe PCM-16 audio (16kHz, mono, signed 16-bit LE).
    // audioData: raw PCM bytes. Throws JanbhashaError on failure.
    virtual ASRResult transcribe(const std::vector<uint8_t>& audioData,
                                 const std::string& languageHint = "hi") = 0;

    // Transcribe from a file URI (WAV or raw PCM).
    virtual ASRResult transcribeFile(const std::string& filePath,
                                     const std::string& languageHint = "hi") = 0;

    // Release all model weights from memory.
    virtual void release() = 0;

    virtual bool isInitialized() const = 0;
    virtual std::string engineName() const = 0;
};

} // namespace janbhasha
