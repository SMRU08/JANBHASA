// ============================================================
// JanbhashaNativeEngine.cpp
// ============================================================
#include "JanbhashaNativeEngine.h"
#include <android/log.h>

#define LOG_TAG "JanbhashaEngine"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO,  LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

namespace janbhasha {

void JanbhashaNativeEngine::initialize(const EngineConfig& config) {
    std::lock_guard<std::mutex> lk(initMutex_);
    throwIf(initialized_.load(), ErrorCode::ALREADY_INITIALIZED,
            "JanbhashaNativeEngine already initialized. Call release() first.");

    LOGI("JanbhashaNativeEngine: initializing...");
    LOGI("  modelsBasePath : %s", config.modelsBasePath.c_str());
    LOGI("  cacheDir       : %s", config.cacheDir.c_str());

    config_ = config;

    // 1. Memory monitoring
    if (config.enableMemoryPolling) {
        MemoryManager::instance().setAlertCallback([](MemoryAlertLevel level,
                                                       const MemorySnapshot& snap) {
            const char* lvl = level == MemoryAlertLevel::OOM      ? "OOM"
                            : level == MemoryAlertLevel::Critical  ? "CRITICAL"
                            : level == MemoryAlertLevel::Warning   ? "WARNING"
                            : "NORMAL";
            __android_log_print(ANDROID_LOG_WARN, "JanbhashaMemory",
                "Memory alert: %s (available=%llu KB, rss=%llu KB)",
                lvl,
                (unsigned long long)snap.availableRamKb,
                (unsigned long long)snap.processRssKb);
        });
        MemoryManager::instance().startPolling(config.memoryPollIntervalMs);
    }

    // 2. Model manager
    modelManager_ = std::make_unique<ModelManager>(
        config.modelsBasePath, config.manifestPath);
    modelManager_->initialize();

    // 3. Audio manager (init recording stream)
    audioManager_ = std::make_unique<AudioManager>();
    try {
        audioManager_->initRecording();
    } catch (const JanbhashaError& e) {
        LOGE("AudioManager init warning: %s (recording may be unavailable)", e.what());
        // Non-fatal — text-only pipeline still works
    }

    // 4. Pipeline manager
    pipelineManager_ = std::make_unique<PipelineManager>(
        *modelManager_, *audioManager_, config.cacheDir);
    pipelineManager_->start();

    initialized_.store(true);
    LOGI("JanbhashaNativeEngine: initialized OK");
}

void JanbhashaNativeEngine::release() {
    std::lock_guard<std::mutex> lk(initMutex_);
    if (!initialized_.load()) return;

    LOGI("JanbhashaNativeEngine: releasing...");

    if (pipelineManager_) {
        pipelineManager_->shutdown();
        pipelineManager_.reset();
    }
    if (modelManager_) {
        // Unload any currently loaded models
        modelManager_->unloadASR();
        modelManager_->unloadNMT();
        modelManager_->unloadTTS();
        modelManager_.reset();
    }
    if (audioManager_) {
        audioManager_.reset();
    }

    MemoryManager::instance().stopPolling();

    initialized_.store(false);
    LOGI("JanbhashaNativeEngine: released");
}

ModelManager& JanbhashaNativeEngine::modelManager() {
    throwIf(!initialized_.load(), ErrorCode::NOT_INITIALIZED,
            "JanbhashaNativeEngine not initialized");
    return *modelManager_;
}

MemoryManager& JanbhashaNativeEngine::memoryManager() {
    return MemoryManager::instance();
}

AudioManager& JanbhashaNativeEngine::audioManager() {
    throwIf(!initialized_.load(), ErrorCode::NOT_INITIALIZED,
            "JanbhashaNativeEngine not initialized");
    return *audioManager_;
}

PipelineManager& JanbhashaNativeEngine::pipelineManager() {
    throwIf(!initialized_.load(), ErrorCode::NOT_INITIALIZED,
            "JanbhashaNativeEngine not initialized");
    return *pipelineManager_;
}

const LanguageConfig& JanbhashaNativeEngine::languageConfig() const {
    return LanguageConfig::instance();
}

} // namespace janbhasha
