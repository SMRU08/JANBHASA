// ============================================================
// ModelManager.h
// Sequential model load/unload with memory budget enforcement.
// ============================================================
#pragma once

#include "MemoryManager.h"
#include "../config/ModelManifest.h"
#include "../asr/IASREngine.h"
#include "../translation/ITranslationEngine.h"
#include "../tts/ITTSEngine.h"
#include "../errors/JanbhashaErrors.h"

#include <memory>
#include <string>
#include <unordered_map>
#include <mutex>
#include <functional>

namespace janbhasha {

enum class ModelState {
    Unavailable,
    Loading,
    Loaded,
    Running,
    Unloading,
    Error
};

struct ModelStatus {
    std::string id;
    ModelState state;
    uint32_t estimatedRamMb;
    std::string error;
};

/**
 * ModelManager
 *
 * Owns and lifecycle-manages all AI model instances.
 *
 * SEQUENTIAL LOADING POLICY (mandatory for 2GB RAM targets):
 *   Load ASR → run ASR → unload ASR
 *   Load NMT → run NMT → unload NMT
 *   Load TTS → run TTS → unload TTS
 *
 * This prevents simultaneous model memory overlap which would OOM
 * on devices with less than ~1.5GB free heap.
 *
 * THREAD SAFETY: loadModel/unloadModel are serialized by a mutex.
 * Engine accessor methods return raw pointers valid only during
 * the load period — callers must NOT hold pointers across unload calls.
 */
class ModelManager {
public:
    using StateCallback = std::function<void(const std::string& modelId, ModelState state)>;

    explicit ModelManager(const std::string& modelsBasePath,
                          const std::string& manifestPath);

    // Initialize manifest from disk. Must be called before any load.
    void initialize();

    // --- ASR --------------------------------------------------------
    // Loads the Whisper ASR model. Throws if OOM or model missing.
    void loadASR(const std::string& modelId = "whisper_small_indic",
                 const std::string& languageHint = "hi");
    void unloadASR();
    IASREngine* asrEngine() const;

    // --- NMT --------------------------------------------------------
    void loadNMT(const std::string& modelId = "indictrans2_en_santali");
    void unloadNMT();
    ITranslationEngine* nmtEngine() const;

    // --- TTS --------------------------------------------------------
    void loadTTS(const std::string& modelId = "vits_sat",
                 const std::string& langCode = "sat");
    void unloadTTS();
    ITTSEngine* ttsEngine() const;

    // --- Status -----------------------------------------------------
    ModelStatus statusOf(const std::string& modelId) const;
    bool isLoaded(const std::string& modelId) const;

    void setStateCallback(StateCallback cb);

    const std::string& modelsBasePath() const { return modelsBasePath_; }

private:
    void assertMemoryBudget(uint32_t requiredMb, const std::string& modelId) const;
    void notifyState(const std::string& modelId, ModelState state);

    std::string modelsBasePath_;
    std::string manifestPath_;

    std::unique_ptr<ModelManifest> manifest_;

    std::unique_ptr<IASREngine>         asrEngine_;
    std::unique_ptr<ITranslationEngine> nmtEngine_;
    std::unique_ptr<ITTSEngine>         ttsEngine_;

    mutable std::mutex mutex_;

    std::unordered_map<std::string, ModelStatus> statusMap_;
    StateCallback stateCallback_;

    std::string currentAsrId_;
    std::string currentNmtId_;
    std::string currentTtsId_;
};

} // namespace janbhasha
