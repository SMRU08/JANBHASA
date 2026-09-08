// ============================================================
// IndicTransEngine.cpp
// IndicTrans2 ONNX Runtime inference — CPU INT8.
// ============================================================
#include "IndicTransEngine.h"
#include "../errors/JanbhashaErrors.h"

#ifdef HAVE_ONNXRUNTIME
#include <onnxruntime_cxx_api.h>
#endif

#include <fstream>
#include <sstream>
#include <chrono>
#include <android/log.h>

#define LOG_TAG "JanbhashaNMT"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO,  LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

namespace janbhasha {

IndicTransEngine::~IndicTransEngine() {
    release();
}

void IndicTransEngine::initialize(const std::string& modelPath) {
    throwIf(initialized_.load(), ErrorCode::MODEL_ALREADY_LOADED,
            "IndicTransEngine already initialized. Call release() first.");

    modelPath_ = modelPath;

    // Verify model files exist
    std::ifstream enc(modelPath + "/encoder_model.onnx");
    throwIf(!enc.is_open(), ErrorCode::MODEL_NOT_FOUND,
            "IndicTrans2 encoder not found: " + modelPath + "/encoder_model.onnx");

    std::ifstream dec(modelPath + "/decoder_model.onnx");
    throwIf(!dec.is_open(), ErrorCode::MODEL_NOT_FOUND,
            "IndicTrans2 decoder not found: " + modelPath + "/decoder_model.onnx");

    LOGI("IndicTransEngine: loading from %s", modelPath.c_str());

#ifdef HAVE_ONNXRUNTIME
    auto* env = new Ort::Env(ORT_LOGGING_LEVEL_WARNING, "JanbhashaNMT");
    Ort::SessionOptions opts;
    opts.SetIntraOpNumThreads(2);
    opts.SetGraphOptimizationLevel(GraphOptimizationLevel::ORT_ENABLE_ALL);

    std::string encoderPath = modelPath + "/encoder_model.onnx";
    std::string decoderPath = modelPath + "/decoder_model.onnx";
    auto* session = new Ort::Session(*env, encoderPath.c_str(), opts);

    ortEnv_     = static_cast<void*>(env);
    ortSession_ = static_cast<void*>(session);
    LOGI("IndicTransEngine: ONNX Runtime native session initialized");
#else
    LOGI("IndicTransEngine: compiled in stub mode (place libonnxruntime.so in android/app/libs to enable)");
#endif

    initialized_.store(true);
    LOGI("IndicTransEngine: initialized OK");
}

void IndicTransEngine::addSupportedPair(const std::string& srcLang,
                                         const std::string& tgtLang) {
    supportedPairs_.insert(makePairKey(srcLang, tgtLang));
}

bool IndicTransEngine::supportsPair(const std::string& srcLang,
                                     const std::string& tgtLang) const {
    return supportedPairs_.count(makePairKey(srcLang, tgtLang)) > 0;
}

std::string IndicTransEngine::wrapWithLanguageTag(const std::string& text,
                                                   const std::string& srcLang,
                                                   const std::string& srcScript) {
    // IndicTrans2 expects source text prefixed with language+script tag.
    // e.g., "[hi_Deva] नमस्ते बच्चों"
    return "[" + srcLang + "_" + srcScript + "] " + text;
}

TranslationResult IndicTransEngine::translate(const TranslationInput& input) {
    throwIf(!initialized_.load(), ErrorCode::NOT_INITIALIZED,
            "IndicTransEngine not initialized");
    throwIf(input.text.empty(), ErrorCode::NMT_EMPTY_INPUT,
            "Translation input text is empty");
    throwIf(!supportsPair(input.sourceLanguage, input.targetLanguage),
            ErrorCode::NMT_UNSUPPORTED_PAIR,
            "Unsupported language pair: " + input.sourceLanguage +
            " -> " + input.targetLanguage);

    auto t0 = std::chrono::steady_clock::now();

    std::string taggedText = wrapWithLanguageTag(
        input.text, input.sourceLanguage, input.sourceScript);

    LOGI("IndicTransEngine: translate() %s->%s, input='%s'",
         input.sourceLanguage.c_str(), input.targetLanguage.c_str(),
         taggedText.substr(0, 60).c_str());

    // ---- ONNX Runtime Inference (uncomment when onnxruntime is linked) ----
    //
    // Tokenize input → encoder → decoder (beam search) → detokenize
    // auto* session = static_cast<Ort::Session*>(ortSession_);
    // ... (tokenization + ONNX session.Run() calls) ...
    // std::string translated = detokenize(output_ids);

    auto t1 = std::chrono::steady_clock::now();
    int64_t latencyMs = std::chrono::duration_cast<std::chrono::milliseconds>(t1 - t0).count();

    TranslationResult result;
    result.sourceText      = input.text;
    result.translatedText  = "[NMT_PLACEHOLDER — link onnxruntime to enable]";
    result.sourceLanguage  = input.sourceLanguage;
    result.sourceScript    = input.sourceScript;
    result.targetLanguage  = input.targetLanguage;
    result.targetScript    = input.targetScript;
    result.latencyMs       = latencyMs;
    return result;
}

void IndicTransEngine::release() {
    if (!initialized_.load()) return;

#ifdef HAVE_ONNXRUNTIME
    if (ortSession_) { delete static_cast<Ort::Session*>(ortSession_); ortSession_ = nullptr; }
    if (ortEnv_)     { delete static_cast<Ort::Env*>(ortEnv_);         ortEnv_ = nullptr;     }
#endif

    initialized_.store(false);
    LOGI("IndicTransEngine: released");
}

} // namespace janbhasha
