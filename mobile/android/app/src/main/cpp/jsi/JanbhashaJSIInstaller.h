// ============================================================
// JanbhashaJSIInstaller.h
// Installs the JSI HostObject into the Hermes runtime.
// Called from the Java/Kotlin side on the JSI thread.
// ============================================================
#pragma once

#include <jni.h>
#include <jsi/jsi.h>
#include <ReactCommon/CallInvoker.h>
#include "JanbhashaJSIHostObject.h"
#include "../engine/JanbhashaNativeEngine.h"

#include <memory>

namespace janbhasha {

/**
 * JanbhashaJSIInstaller
 *
 * Called once from JanbhashaJSIInstaller.kt via JNI:
 *
 *   JanbhashaJSIInstaller.install(jsiRuntime, callInvoker)
 *
 * After install(), JavaScript can call:
 *
 *   global.__janbhasha.initialize({...})
 *   global.__janbhasha.runPipeline({...})
 *   etc.
 */
class JanbhashaJSIInstaller {
public:
    // Install the JSI global. Called on the JSI/Hermes thread.
    // engine must outlive the JavaScript runtime.
    static void install(facebook::jsi::Runtime& runtime,
                         JanbhashaNativeEngine& engine,
                         std::shared_ptr<facebook::react::CallInvoker> callInvoker);

    // JNI entry point — called from Kotlin JanbhashaModule.
    // jsiRuntimeRef: pointer-as-long to the jsi::Runtime (from React Native internals).
    static void installFromJNI(jlong jsiRuntimeRef,
                                JanbhashaNativeEngine& engine,
                                std::shared_ptr<facebook::react::CallInvoker> callInvoker);
};

} // namespace janbhasha
