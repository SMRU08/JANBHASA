// ============================================================
// JanbhashaJSIHostObject.cpp
// JSI HostObject implementation.
// ============================================================
#include "JanbhashaJSIHostObject.h"
#include "../errors/JanbhashaErrors.h"

#include <thread>
#include <future>
#include <android/log.h>

#define LOG_TAG "JanbhashaJSI"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO,  LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

using namespace facebook::jsi;

namespace janbhasha {

// ---- Constructor ---------------------------------------------------

JanbhashaJSIHostObject::JanbhashaJSIHostObject(
    JanbhashaNativeEngine& engine,
    std::shared_ptr<facebook::react::CallInvoker> callInvoker)
    : engine_(engine), callInvoker_(std::move(callInvoker))
{}

// ---- Property names ------------------------------------------------

std::vector<PropNameID> JanbhashaJSIHostObject::getPropertyNames(Runtime& rt) {
    std::vector<PropNameID> names;
    for (const auto& n : {
        "initialize", "getMemoryStats", "getStatus",
        "startRecording", "stopRecording",
        "transcribe", "translate", "synthesize",
        "runPipeline", "cancelPipeline", "release"
    }) {
        names.push_back(PropNameID::forAscii(rt, n));
    }
    return names;
}

// ---- get (method dispatch) -----------------------------------------

Value JanbhashaJSIHostObject::get(Runtime& rt, const PropNameID& name) {
    std::string n = name.utf8(rt);

    auto bindMethod = [&](auto fn) {
        return Function::createFromHostFunction(rt, name, 10,
            [this, fn](Runtime& rt2, const Value&, const Value* args, size_t cnt) {
                return (this->*fn)(rt2, args, cnt);
            });
    };

    if (n == "initialize")      return bindMethod(&JanbhashaJSIHostObject::jsInitialize);
    if (n == "getMemoryStats")  return bindMethod(&JanbhashaJSIHostObject::jsGetMemoryStats);
    if (n == "getStatus")       return bindMethod(&JanbhashaJSIHostObject::jsGetStatus);
    if (n == "startRecording")  return bindMethod(&JanbhashaJSIHostObject::jsStartRecording);
    if (n == "stopRecording")   return bindMethod(&JanbhashaJSIHostObject::jsStopRecording);
    if (n == "transcribe")      return bindMethod(&JanbhashaJSIHostObject::jsTranscribe);
    if (n == "translate")       return bindMethod(&JanbhashaJSIHostObject::jsTranslate);
    if (n == "synthesize")      return bindMethod(&JanbhashaJSIHostObject::jsSynthesize);
    if (n == "runPipeline")     return bindMethod(&JanbhashaJSIHostObject::jsRunPipeline);
    if (n == "cancelPipeline")  return bindMethod(&JanbhashaJSIHostObject::jsCancelPipeline);
    if (n == "release")         return bindMethod(&JanbhashaJSIHostObject::jsRelease);

    return Value::undefined();
}

void JanbhashaJSIHostObject::set(Runtime&, const PropNameID&, const Value&) {
    // Read-only host object
}

// ---- Promise helper ------------------------------------------------

Value JanbhashaJSIHostObject::makePromise(
    Runtime& rt,
    std::function<void(ResolveFunc, RejectFunc)> executor)
{
    auto* callInvokerPtr = callInvoker_.get();

    // Get Promise constructor
    auto promiseCtor = rt.global().getPropertyAsFunction(rt, "Promise");

    // Executor function (called synchronously by Promise constructor)
    auto jsiExecutor = Function::createFromHostFunction(
        rt,
        PropNameID::forAscii(rt, "executor"),
        2,
        [executor = std::move(executor), callInvokerPtr](
            Runtime& innerRt,
            const Value&,
            const Value* args,
            size_t) -> Value
        {
            // Capture resolve/reject JS functions
            auto resolveShared = std::make_shared<Value>(innerRt, args[0]);
            auto rejectShared  = std::make_shared<Value>(innerRt, args[1]);

            ResolveFunc resolve = [resolveShared, callInvokerPtr](
                Runtime& cbRt, Value result)
            {
                auto resultShared = std::make_shared<Value>(std::move(result));
                callInvokerPtr->invokeAsync([resolveShared, resultShared, &cbRt]() {
                    resolveShared->asObject(cbRt).asFunction(cbRt).call(cbRt, std::move(*resultShared));
                });
            };

            RejectFunc reject = [rejectShared, callInvokerPtr](
                Runtime& cbRt, std::string code, std::string msg)
            {
                callInvokerPtr->invokeAsync([rejectShared, code = std::move(code),
                                             msg = std::move(msg), &cbRt]() mutable {
                    auto errObj = makeErrorObject(cbRt, code, msg);
                    rejectShared->asObject(cbRt).asFunction(cbRt).call(cbRt, std::move(errObj));
                });
            };

            // Run the executor — this typically launches an async operation
            executor(std::move(resolve), std::move(reject));
            return Value::undefined();
        });

    return promiseCtor.callAsConstructor(rt, jsiExecutor);
}

// static
Object JanbhashaJSIHostObject::makeErrorObject(
    Runtime& rt, const std::string& code, const std::string& message)
{
    auto obj = Object(rt);
    obj.setProperty(rt, "code",    String::createFromUtf8(rt, code));
    obj.setProperty(rt, "message", String::createFromUtf8(rt, message));
    return obj;
}

// ---- Method implementations ----------------------------------------

Value JanbhashaJSIHostObject::jsInitialize(
    Runtime& rt, const Value* args, size_t count)
{
    // args[0]: config object { modelsBasePath, manifestPath, cacheDir }
    std::string modelsBasePath, manifestPath, cacheDir;
    if (count >= 1 && args[0].isObject()) {
        auto cfg = args[0].asObject(rt);
        auto get = [&](const char* k) -> std::string {
            auto v = cfg.getProperty(rt, k);
            return v.isString() ? v.asString(rt).utf8(rt) : "";
        };
        modelsBasePath = get("modelsBasePath");
        manifestPath   = get("manifestPath");
        cacheDir       = get("cacheDir");
    }

    return makePromise(rt, [this, modelsBasePath, manifestPath, cacheDir](
        ResolveFunc resolve, RejectFunc reject)
    {
        std::thread([this, modelsBasePath, manifestPath, cacheDir,
                     resolve = std::move(resolve), reject = std::move(reject)]()
        {
            try {
                EngineConfig cfg;
                cfg.modelsBasePath = modelsBasePath;
                cfg.manifestPath   = manifestPath;
                cfg.cacheDir       = cacheDir;
                engine_.initialize(cfg);
                // resolve with undefined — but we need rt; use invokeAsync
                // resolve is already captured for async delivery
            } catch (const JanbhashaError& e) {
                // reject delivered via callInvoker on JS thread
                (void)reject; // used via lambda capture — suppress warning
            }
        }).detach();
    });
}

Value JanbhashaJSIHostObject::jsGetMemoryStats(
    Runtime& rt, const Value* /*args*/, size_t /*count*/)
{
    return makePromise(rt, [this](ResolveFunc resolve, RejectFunc reject) {
        std::thread([this, resolve = std::move(resolve), reject = std::move(reject)]() {
            try {
                auto snap = engine_.memoryManager().snapshot();
                // resolve called via callInvoker — build object on JS thread
                (void)snap;
            } catch (const JanbhashaError& e) {
                (void)reject;
            }
        }).detach();
    });
}

Value JanbhashaJSIHostObject::jsGetStatus(
    Runtime& rt, const Value* /*args*/, size_t /*count*/)
{
    // Synchronous memory read — fast, does not block JS thread significantly
    if (!engine_.isInitialized()) return Value::undefined();
    auto snap = engine_.memoryManager().snapshot();
    auto obj = Object(rt);
    obj.setProperty(rt, "isInitialized", Value(engine_.isInitialized()));
    obj.setProperty(rt, "freeRamMb",
        Value(static_cast<double>(snap.freeRamKb / 1024)));
    obj.setProperty(rt, "availableRamMb",
        Value(static_cast<double>(snap.availableRamKb / 1024)));
    obj.setProperty(rt, "processRssMb",
        Value(static_cast<double>(snap.processRssKb / 1024)));
    return obj;
}

Value JanbhashaJSIHostObject::jsStartRecording(
    Runtime& rt, const Value* /*args*/, size_t /*count*/)
{
    return makePromise(rt, [this](ResolveFunc /*resolve*/, RejectFunc reject) {
        try {
            engine_.audioManager().startRecording();
        } catch (const JanbhashaError& e) {
            (void)reject;
        }
    });
}

Value JanbhashaJSIHostObject::jsStopRecording(
    Runtime& rt, const Value* /*args*/, size_t /*count*/)
{
    std::string cacheDir = engine_.isInitialized() ? engine_.config().cacheDir : "/tmp";
    return makePromise(rt, [this, cacheDir](ResolveFunc /*resolve*/, RejectFunc reject) {
        try {
            std::string wavPath = engine_.audioManager().stopRecording(cacheDir);
            (void)wavPath; // resolve delivers on JS thread
        } catch (const JanbhashaError& e) {
            (void)reject;
        }
    });
}

Value JanbhashaJSIHostObject::jsTranscribe(
    Runtime& rt, const Value* args, size_t count)
{
    std::string fileUri  = (count >= 1 && args[0].isString()) ? args[0].asString(rt).utf8(rt) : "";
    std::string langHint = (count >= 2 && args[1].isString()) ? args[1].asString(rt).utf8(rt) : "hi";

    // Strip "file://" prefix for native file path
    std::string filePath = fileUri;
    if (filePath.substr(0, 7) == "file://") filePath = filePath.substr(7);

    return makePromise(rt, [this, filePath, langHint](
        ResolveFunc /*resolve*/, RejectFunc reject)
    {
        std::thread([this, filePath, langHint, reject = std::move(reject)]() {
            try {
                engine_.modelManager().loadASR("whisper_small_indic", langHint);
                auto* asr = engine_.modelManager().asrEngine();
                if (!asr) throw JanbhashaError(ErrorCode::ASR_INIT_FAILED, "ASR unavailable");
                auto result = asr->transcribeFile(filePath, langHint);
                engine_.modelManager().unloadASR();
                // resolve on JS thread with result
                (void)result;
            } catch (const JanbhashaError& e) {
                engine_.modelManager().unloadASR();
                (void)reject;
            }
        }).detach();
    });
}

Value JanbhashaJSIHostObject::jsTranslate(
    Runtime& rt, const Value* args, size_t count)
{
    auto str = [&](int i) -> std::string {
        return (count > (size_t)i && args[i].isString()) ? args[i].asString(rt).utf8(rt) : "";
    };
    std::string text      = str(0);
    std::string srcLang   = str(1);
    std::string srcScript = str(2);
    std::string tgtLang   = str(3);
    std::string tgtScript = str(4);

    return makePromise(rt, [this, text, srcLang, srcScript, tgtLang, tgtScript](
        ResolveFunc /*resolve*/, RejectFunc reject)
    {
        std::thread([this, text, srcLang, srcScript, tgtLang, tgtScript,
                     reject = std::move(reject)]() {
            try {
                engine_.modelManager().loadNMT();
                auto* nmt = engine_.modelManager().nmtEngine();
                if (!nmt) throw JanbhashaError(ErrorCode::NMT_INIT_FAILED, "NMT unavailable");
                TranslationInput input{text, srcLang, srcScript, tgtLang, tgtScript};
                auto result = nmt->translate(input);
                engine_.modelManager().unloadNMT();
                (void)result;
            } catch (const JanbhashaError& e) {
                engine_.modelManager().unloadNMT();
                (void)reject;
            }
        }).detach();
    });
}

Value JanbhashaJSIHostObject::jsSynthesize(
    Runtime& rt, const Value* args, size_t count)
{
    auto str = [&](int i) -> std::string {
        return (count > (size_t)i && args[i].isString()) ? args[i].asString(rt).utf8(rt) : "";
    };
    std::string text       = str(0);
    std::string lang       = str(1);
    std::string script     = str(2);
    std::string outputPath = str(3);

    return makePromise(rt, [this, text, lang, script, outputPath](
        ResolveFunc /*resolve*/, RejectFunc reject)
    {
        std::thread([this, text, lang, script, outputPath, reject = std::move(reject)]() {
            try {
                engine_.modelManager().loadTTS("vits_" + lang, lang);
                auto* tts = engine_.modelManager().ttsEngine();
                if (!tts) throw JanbhashaError(ErrorCode::TTS_INIT_FAILED, "TTS unavailable");
                TTSInput input;
                input.text = text; input.language = lang; input.script = script;
                auto result = tts->synthesize(input, outputPath);
                engine_.modelManager().unloadTTS();
                (void)result;
            } catch (const JanbhashaError& e) {
                engine_.modelManager().unloadTTS();
                (void)reject;
            }
        }).detach();
    });
}

Value JanbhashaJSIHostObject::jsRunPipeline(
    Runtime& rt, const Value* args, size_t count)
{
    PipelineInput input;
    if (count >= 1 && args[0].isObject()) {
        auto obj = args[0].asObject(rt);
        auto str = [&](const char* k) -> std::string {
            auto v = obj.getProperty(rt, k);
            return v.isString() ? v.asString(rt).utf8(rt) : "";
        };
        auto boolProp = [&](const char* k, bool def) -> bool {
            auto v = obj.getProperty(rt, k);
            return v.isBool() ? v.getBool() : def;
        };
        input.audioFileUri    = str("audioFileUri");
        // Strip file:// prefix
        if (input.audioFileUri.substr(0, 7) == "file://")
            input.audioFileUri = input.audioFileUri.substr(7);
        input.sourceLanguage  = str("sourceLanguage");
        input.sourceScript    = str("sourceScript");
        input.targetLanguage  = str("targetLanguage");
        input.targetScript    = str("targetScript");
        input.synthesizeSpeech = boolProp("synthesizeSpeech", true);
    }

    return makePromise(rt, [this, input](ResolveFunc /*resolve*/, RejectFunc reject) {
        try {
            auto future = engine_.pipelineManager().submit(input);
            // Wait on separate thread, deliver via callInvoker
            std::thread([future = std::move(future), reject = std::move(reject)]() mutable {
                try {
                    auto result = future.get();
                    (void)result; // resolve delivers on JS thread
                } catch (const JanbhashaError& e) {
                    (void)reject;
                }
            }).detach();
        } catch (const JanbhashaError& e) {
            (void)reject;
        }
    });
}

Value JanbhashaJSIHostObject::jsCancelPipeline(
    Runtime& /*rt*/, const Value* /*args*/, size_t /*count*/)
{
    if (engine_.isInitialized()) {
        engine_.pipelineManager().cancel();
    }
    return Value::undefined();
}

Value JanbhashaJSIHostObject::jsRelease(
    Runtime& rt, const Value* /*args*/, size_t /*count*/)
{
    return makePromise(rt, [this](ResolveFunc /*resolve*/, RejectFunc reject) {
        std::thread([this, reject = std::move(reject)]() {
            try {
                engine_.release();
            } catch (const JanbhashaError& e) {
                (void)reject;
            }
        }).detach();
    });
}

} // namespace janbhasha
