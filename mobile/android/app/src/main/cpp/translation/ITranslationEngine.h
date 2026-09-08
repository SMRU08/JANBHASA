// ============================================================
// ITranslationEngine.h
// Pure abstract interface for NMT adapters.
// ============================================================
#pragma once

#include <string>
#include <vector>
#include <cstdint>

namespace janbhasha {

struct TranslationResult {
    std::string sourceText;
    std::string translatedText;
    std::string sourceLanguage;   // BCP-47
    std::string sourceScript;     // ISO 15924
    std::string targetLanguage;
    std::string targetScript;
    int64_t latencyMs;
};

struct TranslationInput {
    std::string text;
    std::string sourceLanguage;
    std::string sourceScript;
    std::string targetLanguage;
    std::string targetScript;
};

/**
 * ITranslationEngine — pure interface.
 * Implementors: IndicTransEngine.
 *
 * CONTRACT:
 *  - initialize() must be called before translate().
 *  - translate() must be thread-safe per the same rules as IASREngine.
 *  - release() must be idempotent.
 */
class ITranslationEngine {
public:
    virtual ~ITranslationEngine() = default;

    virtual void initialize(const std::string& modelPath) = 0;

    virtual TranslationResult translate(const TranslationInput& input) = 0;

    virtual bool supportsPair(const std::string& srcLang,
                              const std::string& tgtLang) const = 0;

    virtual void release() = 0;
    virtual bool isInitialized() const = 0;
    virtual std::string engineName() const = 0;
};

} // namespace janbhasha
