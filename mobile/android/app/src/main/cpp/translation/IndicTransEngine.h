// ============================================================
// IndicTransEngine.h
// IndicTrans2 ONNX Runtime adapter for offline NMT.
// ============================================================
#pragma once

#include "ITranslationEngine.h"
#include <string>
#include <vector>
#include <memory>
#include <atomic>
#include <unordered_set>

// Forward-declare ONNX Runtime session to avoid header pollution.
namespace Ort { class Session; class Env; class SessionOptions; }

namespace janbhasha {

/**
 * IndicTransEngine
 *
 * Wraps ONNX Runtime inference for IndicTrans2 (exported to ONNX).
 *
 * Model directory layout on device:
 *   <modelPath>/
 *     encoder_model.onnx
 *     decoder_model.onnx
 *     tokenizer.json          (SentencePiece vocab in JSON format)
 *     special_tokens_map.json
 *
 * Quantization: INT8 ONNX (quantized offline using onnxruntime.quantization).
 *
 * Supported language pairs are registered via addSupportedPair().
 * The engine does NOT hardcode specific pairs.
 */
class IndicTransEngine final : public ITranslationEngine {
public:
    IndicTransEngine() = default;
    ~IndicTransEngine() override;

    void initialize(const std::string& modelPath) override;

    TranslationResult translate(const TranslationInput& input) override;

    void addSupportedPair(const std::string& srcLang, const std::string& tgtLang);

    bool supportsPair(const std::string& srcLang,
                      const std::string& tgtLang) const override;

    void release() override;
    bool isInitialized() const override { return initialized_.load(); }
    std::string engineName() const override { return "IndicTransEngine/ONNX"; }

private:
    std::string makePairKey(const std::string& src, const std::string& tgt) const {
        return src + "->" + tgt;
    }

    // IndicTrans2 uses language tags embedded in source text.
    // Format: "[hi_Deva] नमस्ते"
    static std::string wrapWithLanguageTag(const std::string& text,
                                           const std::string& srcLang,
                                           const std::string& srcScript);

    std::string modelPath_;
    std::atomic<bool> initialized_{false};
    std::unordered_set<std::string> supportedPairs_;

    // ONNX Runtime objects — heap-allocated, void* to avoid header pollution.
    void* ortEnv_     = nullptr;
    void* ortSession_ = nullptr;
};

} // namespace janbhasha
