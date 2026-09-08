// ============================================================
// JanbhashaJSIHostObject.h
// JSI HostObject — the object that lives in the Hermes JS heap
// and delegates every call to JanbhashaNativeEngine on the
// native worker thread.
//
// Threading contract:
//   - All JSI get/set calls arrive on the Hermes JS thread.
//   - Blocking operations (pipeline, model load) are dispatched
//     to the PipelineManager worker thread via std::future.
//   - Callbacks into JS are delivered via the React Native
//     CallInvoker on the JS thread.
//   - The JS thread is NEVER blocked.
// ============================================================
#pragma once

#include <jsi/jsi.h>
#include <ReactCommon/CallInvoker.h>

#include "JanbhashaNativeEngine.h"
#include <memory>
#include <string>

namespace janbhasha {

/**
 * JanbhashaJSIHostObject
 *
 * Exposed to JavaScript as:  global.__janbhasha
 *
 * Available JS properties (all async, return Promises):
 *
 *   __janbhasha.initialize(config)     → Promise<void>
 *   __janbhasha.getMemoryStats()       → Promise<MemoryStats>
 *   __janbhasha.getStatus()            → Promise<EngineStatus>
 *   __janbhasha.startRecording()       → Promise<void>
 *   __janbhasha.stopRecording()        → Promise<string>  // file URI
 *   __janbhasha.transcribe(fileUri, lang)   → Promise<ASRResult>
 *   __janbhasha.translate(text, srcLang, srcScript, tgtLang, tgtScript)
 *                                      → Promise<TranslationResult>
 *   __janbhasha.synthesize(text, lang, script, outputPath)
 *                                      → Promise<TTSResult>
 *   __janbhasha.runPipeline(input)     → Promise<PipelineResult>
 *   __janbhasha.cancelPipeline()       → undefined  (synchronous)
 *   __janbhasha.release()              → Promise<void>
 *
 * All Promises reject with { code: string, message: string }
 * where `code` is a JanbhashaErrors error code string.
 */
class JanbhashaJSIHostObject : public facebook::jsi::HostObject {
public:
    JanbhashaJSIHostObject(
        JanbhashaNativeEngine& engine,
        std::shared_ptr<facebook::react::CallInvoker> callInvoker);

    // HostObject interface
    facebook::jsi::Value get(facebook::jsi::Runtime& rt,
                              const facebook::jsi::PropNameID& name) override;

    void set(facebook::jsi::Runtime& rt,
             const facebook::jsi::PropNameID& name,
             const facebook::jsi::Value& value) override;

    std::vector<facebook::jsi::PropNameID> getPropertyNames(
        facebook::jsi::Runtime& rt) override;

private:
    JanbhashaNativeEngine& engine_;
    std::shared_ptr<facebook::react::CallInvoker> callInvoker_;

    // ---- Method implementations ------------------------------------
    facebook::jsi::Value jsInitialize(
        facebook::jsi::Runtime& rt,
        const facebook::jsi::Value* args, size_t count);

    facebook::jsi::Value jsGetMemoryStats(
        facebook::jsi::Runtime& rt,
        const facebook::jsi::Value* args, size_t count);

    facebook::jsi::Value jsGetStatus(
        facebook::jsi::Runtime& rt,
        const facebook::jsi::Value* args, size_t count);

    facebook::jsi::Value jsStartRecording(
        facebook::jsi::Runtime& rt,
        const facebook::jsi::Value* args, size_t count);

    facebook::jsi::Value jsStopRecording(
        facebook::jsi::Runtime& rt,
        const facebook::jsi::Value* args, size_t count);

    facebook::jsi::Value jsTranscribe(
        facebook::jsi::Runtime& rt,
        const facebook::jsi::Value* args, size_t count);

    facebook::jsi::Value jsTranslate(
        facebook::jsi::Runtime& rt,
        const facebook::jsi::Value* args, size_t count);

    facebook::jsi::Value jsSynthesize(
        facebook::jsi::Runtime& rt,
        const facebook::jsi::Value* args, size_t count);

    facebook::jsi::Value jsRunPipeline(
        facebook::jsi::Runtime& rt,
        const facebook::jsi::Value* args, size_t count);

    facebook::jsi::Value jsCancelPipeline(
        facebook::jsi::Runtime& rt,
        const facebook::jsi::Value* args, size_t count);

    facebook::jsi::Value jsRelease(
        facebook::jsi::Runtime& rt,
        const facebook::jsi::Value* args, size_t count);

    // ---- Helpers ---------------------------------------------------

    // Creates a JS Promise. resolve/reject are called on the JS thread
    // via callInvoker.
    using ResolveFunc = std::function<void(facebook::jsi::Runtime&, facebook::jsi::Value)>;
    using RejectFunc  = std::function<void(facebook::jsi::Runtime&, std::string code, std::string msg)>;

    facebook::jsi::Value makePromise(
        facebook::jsi::Runtime& rt,
        std::function<void(ResolveFunc, RejectFunc)> executor);

    // Build a JS error object {code, message} for Promise rejection.
    static facebook::jsi::Object makeErrorObject(
        facebook::jsi::Runtime& rt,
        const std::string& code,
        const std::string& message);
};

} // namespace janbhasha
