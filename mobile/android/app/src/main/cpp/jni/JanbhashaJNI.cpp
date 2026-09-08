// ============================================================
// JanbhashaJNI.cpp
// JNI entry point called by Kotlin JanbhashaModule.
// ============================================================
#include <jni.h>
#include "../engine/JanbhashaNativeEngine.h"
#include "../jsi/JanbhashaJSIInstaller.h"
#include <android/log.h>
#include <memory>

#define LOG_TAG "JanbhashaJNI"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

// Global engine instance — owned by the JNI layer.
// Lifecycle: created in nativeInitialize(), destroyed in nativeRelease().
static std::unique_ptr<janbhasha::JanbhashaNativeEngine> g_engine;

extern "C" {

/**
 * Called from Kotlin: JanbhashaModule.nativeInitialize(...)
 *
 * @param jsiRuntimeRef  Pointer to jsi::Runtime cast to jlong
 * @param modelsBasePath Absolute path to models/ directory
 * @param manifestPath   Absolute path to model_manifest.json
 * @param cacheDir       Absolute path to cache directory
 */
JNIEXPORT void JNICALL
Java_com_janbhasha_JanbhashaModule_nativeInitialize(
    JNIEnv* env,
    jobject /*thiz*/,
    jlong jsiRuntimeRef,
    jstring jModelsBasePath,
    jstring jManifestPath,
    jstring jCacheDir,
    jobject callInvokerHolder)
{
    LOGI("nativeInitialize: starting");

    const char* modelsBasePath = env->GetStringUTFChars(jModelsBasePath, nullptr);
    const char* manifestPath   = env->GetStringUTFChars(jManifestPath,   nullptr);
    const char* cacheDir       = env->GetStringUTFChars(jCacheDir,       nullptr);

    janbhasha::EngineConfig cfg;
    cfg.modelsBasePath = modelsBasePath;
    cfg.manifestPath   = manifestPath;
    cfg.cacheDir       = cacheDir;

    env->ReleaseStringUTFChars(jModelsBasePath, modelsBasePath);
    env->ReleaseStringUTFChars(jManifestPath,   manifestPath);
    env->ReleaseStringUTFChars(jCacheDir,       cacheDir);

    try {
        if (!g_engine) {
            g_engine = std::make_unique<janbhasha::JanbhashaNativeEngine>();
        }
        g_engine->initialize(cfg);

        // Install JSI global
        // callInvokerHolder is a com.facebook.react.turbomodule.core.CallInvokerHolderImpl
        // React Native provides a helper to extract the native CallInvoker from it.
        // For RN 0.74, use:
        //   auto callInvoker = facebook::react::CallInvokerHolder::fromJavaCallInvoker(env, callInvokerHolder);
        // Placeholder until CallInvokerHolder JNI binding is added:
        auto callInvoker = std::shared_ptr<facebook::react::CallInvoker>(nullptr);

        janbhasha::JanbhashaJSIInstaller::installFromJNI(
            jsiRuntimeRef, *g_engine, callInvoker);

        LOGI("nativeInitialize: complete");
    } catch (const janbhasha::JanbhashaError& e) {
        LOGE("nativeInitialize failed: [%d] %s",
             e.codeInt(), e.what());
        env->ThrowNew(
            env->FindClass("java/lang/RuntimeException"),
            e.what());
    }
}

/**
 * Called from Kotlin: JanbhashaModule.nativeRelease()
 */
JNIEXPORT void JNICALL
Java_com_janbhasha_JanbhashaModule_nativeRelease(
    JNIEnv* /*env*/, jobject /*thiz*/)
{
    LOGI("nativeRelease: releasing engine");
    if (g_engine) {
        g_engine->release();
        g_engine.reset();
    }
    LOGI("nativeRelease: complete");
}

/**
 * Called from Kotlin: JanbhashaModule.nativeCancelPipeline()
 */
JNIEXPORT void JNICALL
Java_com_janbhasha_JanbhashaModule_nativeCancelPipeline(
    JNIEnv* /*env*/, jobject /*thiz*/)
{
    if (g_engine && g_engine->isInitialized()) {
        g_engine->pipelineManager().cancel();
    }
}

} // extern "C"
