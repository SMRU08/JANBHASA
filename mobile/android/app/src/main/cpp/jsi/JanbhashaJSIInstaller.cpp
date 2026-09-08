// ============================================================
// JanbhashaJSIInstaller.cpp
// ============================================================
#include "JanbhashaJSIInstaller.h"
#include <android/log.h>

#define LOG_TAG "JanbhashaJSIInstall"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)

using namespace facebook::jsi;

namespace janbhasha {

void JanbhashaJSIInstaller::install(
    Runtime& runtime,
    JanbhashaNativeEngine& engine,
    std::shared_ptr<facebook::react::CallInvoker> callInvoker)
{
    LOGI("Installing JSI HostObject as global.__janbhasha");

    auto hostObject = std::make_shared<JanbhashaJSIHostObject>(engine, callInvoker);

    runtime.global().setProperty(
        runtime,
        "__janbhasha",
        Object::createFromHostObject(runtime, hostObject));

    LOGI("JSI HostObject installed: global.__janbhasha is ready");
}

void JanbhashaJSIInstaller::installFromJNI(
    jlong jsiRuntimeRef,
    JanbhashaNativeEngine& engine,
    std::shared_ptr<facebook::react::CallInvoker> callInvoker)
{
    // Cast the long pointer back to jsi::Runtime* (React Native internal convention)
    auto* runtime = reinterpret_cast<Runtime*>(jsiRuntimeRef);
    install(*runtime, engine, std::move(callInvoker));
}

} // namespace janbhasha
