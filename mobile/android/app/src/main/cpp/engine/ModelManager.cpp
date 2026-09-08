// ============================================================
// ModelManager.cpp
// ============================================================
#include "ModelManager.h"
#include "../asr/WhisperASREngine.h"
#include "../translation/IndicTransEngine.h"
#include "../tts/VITSTTSEngine.h"
#include "../tts/IndicParlerTTSEngine.h"
#include "../config/LanguageConfig.h"

#include <android/log.h>

#define LOG_TAG "JanbhashaModels"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO,  LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

namespace janbhasha {

ModelManager::ModelManager(const std::string& modelsBasePath,
                            const std::string& manifestPath)
    : modelsBasePath_(modelsBasePath), manifestPath_(manifestPath) {}

void ModelManager::initialize() {
    manifest_ = std::make_unique<ModelManifest>(manifestPath_);
    manifest_->load();
    LOGI("ModelManager: manifest loaded, %zu entries",
         manifest_->entries().size());
}

void ModelManager::notifyState(const std::string& modelId, ModelState state) {
    {
        std::lock_guard<std::mutex> lk(mutex_);
        statusMap_[modelId].state = state;
    }
    if (stateCallback_) stateCallback_(modelId, state);
}

void ModelManager::assertMemoryBudget(uint32_t requiredMb,
                                       const std::string& modelId) const {
    auto& mm = MemoryManager::instance();
    throwIf(!mm.canLoadModel(requiredMb), ErrorCode::OOM_PREVENTED,
            "Not enough free RAM to load " + modelId +
            " (requires ~" + std::to_string(requiredMb) + " MB)");
}

void ModelManager::setStateCallback(StateCallback cb) {
    std::lock_guard<std::mutex> lk(mutex_);
    stateCallback_ = std::move(cb);
}

ModelStatus ModelManager::statusOf(const std::string& modelId) const {
    std::lock_guard<std::mutex> lk(mutex_);
    auto it = statusMap_.find(modelId);
    if (it == statusMap_.end()) {
        return ModelStatus{modelId, ModelState::Unavailable, 0, ""};
    }
    return it->second;
}

bool ModelManager::isLoaded(const std::string& modelId) const {
    auto s = statusOf(modelId);
    return s.state == ModelState::Loaded || s.state == ModelState::Running;
}

// ---- ASR -----------------------------------------------------------

void ModelManager::loadASR(const std::string& modelId,
                             const std::string& languageHint) {
    std::lock_guard<std::mutex> lk(mutex_);

    if (asrEngine_ && asrEngine_->isInitialized()) {
        LOGI("ModelManager: ASR already loaded (%s)", modelId.c_str());
        return;
    }

    // Strict sequential loading policy (mandatory for 2GB RAM budget):
    // Unload any active NMT or TTS engines before allocating ASR memory
    if (nmtEngine_) {
        LOGI("ModelManager: Auto-unloading NMT before loading ASR to preserve 2GB RAM budget");
        nmtEngine_->release();
        nmtEngine_.reset();
    }
    if (ttsEngine_) {
        LOGI("ModelManager: Auto-unloading TTS before loading ASR to preserve 2GB RAM budget");
        ttsEngine_->release();
        ttsEngine_.reset();
    }

    // Lookup manifest entry
    auto entry = manifest_->find(modelId);
    uint32_t ramMb = entry ? entry->estimatedRamMb : 280;
    assertMemoryBudget(ramMb, modelId);

    notifyState(modelId, ModelState::Loading);
    try {
        std::string modelPath = modelsBasePath_ + "/asr/" + modelId;
        auto engine = std::make_unique<WhisperASREngine>();
        engine->initialize(modelPath, languageHint);
        asrEngine_   = std::move(engine);
        currentAsrId_ = modelId;
        statusMap_[modelId] = {modelId, ModelState::Loaded, ramMb, ""};
        notifyState(modelId, ModelState::Loaded);
        LOGI("ModelManager: ASR loaded (%s)", modelId.c_str());
    } catch (const JanbhashaError& e) {
        statusMap_[modelId] = {modelId, ModelState::Error, 0, e.what()};
        notifyState(modelId, ModelState::Error);
        throw;
    }
}

void ModelManager::unloadASR() {
    std::lock_guard<std::mutex> lk(mutex_);
    if (!asrEngine_) return;
    notifyState(currentAsrId_, ModelState::Unloading);
    asrEngine_->release();
    asrEngine_.reset();
    statusMap_[currentAsrId_].state = ModelState::Unavailable;
    notifyState(currentAsrId_, ModelState::Unavailable);
    LOGI("ModelManager: ASR unloaded");
}

IASREngine* ModelManager::asrEngine() const {
    return asrEngine_.get();
}

// ---- NMT -----------------------------------------------------------

void ModelManager::loadNMT(const std::string& modelId) {
    std::lock_guard<std::mutex> lk(mutex_);

    if (nmtEngine_ && nmtEngine_->isInitialized()) {
        LOGI("ModelManager: NMT already loaded (%s)", modelId.c_str());
        return;
    }

    // Strict sequential loading policy (mandatory for 2GB RAM budget):
    if (asrEngine_) {
        LOGI("ModelManager: Auto-unloading ASR before loading NMT to preserve 2GB RAM budget");
        asrEngine_->release();
        asrEngine_.reset();
    }
    if (ttsEngine_) {
        LOGI("ModelManager: Auto-unloading TTS before loading NMT to preserve 2GB RAM budget");
        ttsEngine_->release();
        ttsEngine_.reset();
    }

    auto entry = manifest_->find(modelId);
    uint32_t ramMb = entry ? entry->estimatedRamMb : 380;
    assertMemoryBudget(ramMb, modelId);

    notifyState(modelId, ModelState::Loading);
    try {
        std::string modelPath = modelsBasePath_ + "/translation/" + modelId;
        auto engine = std::make_unique<IndicTransEngine>();

        // Register all language pairs from LanguageConfig
        const auto& pairs = LanguageConfig::instance().supportedPairs();
        for (const auto& p : pairs) {
            engine->addSupportedPair(p.sourceLang, p.targetLang);
        }

        engine->initialize(modelPath);
        nmtEngine_    = std::move(engine);
        currentNmtId_ = modelId;
        statusMap_[modelId] = {modelId, ModelState::Loaded, ramMb, ""};
        notifyState(modelId, ModelState::Loaded);
        LOGI("ModelManager: NMT loaded (%s)", modelId.c_str());
    } catch (const JanbhashaError& e) {
        statusMap_[modelId] = {modelId, ModelState::Error, 0, e.what()};
        notifyState(modelId, ModelState::Error);
        throw;
    }
}

void ModelManager::unloadNMT() {
    std::lock_guard<std::mutex> lk(mutex_);
    if (!nmtEngine_) return;
    notifyState(currentNmtId_, ModelState::Unloading);
    nmtEngine_->release();
    nmtEngine_.reset();
    statusMap_[currentNmtId_].state = ModelState::Unavailable;
    notifyState(currentNmtId_, ModelState::Unavailable);
    LOGI("ModelManager: NMT unloaded");
}

ITranslationEngine* ModelManager::nmtEngine() const {
    return nmtEngine_.get();
}

// ---- TTS -----------------------------------------------------------

void ModelManager::loadTTS(const std::string& modelId,
                             const std::string& langCode) {
    std::lock_guard<std::mutex> lk(mutex_);

    if (ttsEngine_ && ttsEngine_->isInitialized()) {
        LOGI("ModelManager: TTS already loaded (%s)", modelId.c_str());
        return;
    }

    // Strict sequential loading policy (mandatory for 2GB RAM budget):
    if (asrEngine_) {
        LOGI("ModelManager: Auto-unloading ASR before loading TTS to preserve 2GB RAM budget");
        asrEngine_->release();
        asrEngine_.reset();
    }
    if (nmtEngine_) {
        LOGI("ModelManager: Auto-unloading NMT before loading TTS to preserve 2GB RAM budget");
        nmtEngine_->release();
        nmtEngine_.reset();
    }

    auto entry = manifest_->find(modelId);
    uint32_t ramMb = entry ? entry->estimatedRamMb : 145;
    assertMemoryBudget(ramMb, modelId);

    notifyState(modelId, ModelState::Loading);
    try {
        std::string modelPath = modelsBasePath_ + "/tts/" + modelId;
        std::unique_ptr<ITTSEngine> engine;
        if (modelId.find("parler") != std::string::npos || langCode == "sat") {
            auto parlerEngine = std::make_unique<IndicParlerTTSEngine>();
            parlerEngine->initialize(modelPath);
            engine = std::move(parlerEngine);
        } else {
            auto vitsEngine = std::make_unique<VITSTTSEngine>();
            vitsEngine->addSupportedLanguage(langCode);
            vitsEngine->initialize(modelPath);
            engine = std::move(vitsEngine);
        }
        ttsEngine_    = std::move(engine);
        currentTtsId_ = modelId;
        statusMap_[modelId] = {modelId, ModelState::Loaded, ramMb, ""};
        notifyState(modelId, ModelState::Loaded);
        LOGI("ModelManager: TTS loaded (%s, lang=%s)", modelId.c_str(), langCode.c_str());
    } catch (const JanbhashaError& e) {
        statusMap_[modelId] = {modelId, ModelState::Error, 0, e.what()};
        notifyState(modelId, ModelState::Error);
        throw;
    }
}

void ModelManager::unloadTTS() {
    std::lock_guard<std::mutex> lk(mutex_);
    if (!ttsEngine_) return;
    notifyState(currentTtsId_, ModelState::Unloading);
    ttsEngine_->release();
    ttsEngine_.reset();
    statusMap_[currentTtsId_].state = ModelState::Unavailable;
    notifyState(currentTtsId_, ModelState::Unavailable);
    LOGI("ModelManager: TTS unloaded");
}

ITTSEngine* ModelManager::ttsEngine() const {
    return ttsEngine_.get();
}

} // namespace janbhasha
