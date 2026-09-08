#pragma once

#include <jsi/jsi.h>
#include <memory>
#include <string>
#include <vector>
#include <functional>

namespace facebook {
namespace jsi {

/**
 * Janbhasha C++ JSI Native Bridge for Extreme Offline Audio & INT8 Inference.
 * 
 * Provides direct zero-copy access between Hermes JavaScript runtime and native
 * C++ INT8 quantized runtimes (CTranslate2 Whisper ASR, IndicTrans2, VITS).
 * Prevents bridge serialization overhead and GC pressure on 2GB RAM Android tablets.
 */
class JanbhashaAudioJSIBridge {
public:
    static void install(Runtime& jsiRuntime);

    // Synchronous memory & model validation
    static Value getMemoryStatus(Runtime& runtime, const Value& thisValue, const Value* arguments, size_t count);
    static Value isModelLoaded(Runtime& runtime, const Value& thisValue, const Value* arguments, size_t count);

    // Fast zero-copy audio stream & inference triggers
    static Value processAudioBuffer(Runtime& runtime, const Value& thisValue, const Value* arguments, size_t count);
    static Value translateTextSync(Runtime& runtime, const Value& thisValue, const Value* arguments, size_t count);
    static Value synthesizeSpeechSync(Runtime& runtime, const Value& thisValue, const Value* arguments, size_t count);

    // Asynchronous Voice-to-Voice pipeline (runs on detached native worker thread)
    static Value runVoiceToVoicePipelineAsync(Runtime& runtime, const Value& thisValue, const Value* arguments, size_t count);
};

} // namespace jsi
} // namespace facebook
