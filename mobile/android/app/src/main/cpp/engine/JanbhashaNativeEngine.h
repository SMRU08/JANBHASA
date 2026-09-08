// ============================================================
// JanbhashaNativeEngine.h
// Top-level RAII orchestrator — owns all subsystems.
// ============================================================
#pragma once

#include "ModelManager.h"
#include "MemoryManager.h"
#include "../audio/AudioManager.h"
#include "../pipeline/PipelineManager.h"
#include "../config/LanguageConfig.h"
#include "../config/ModelManifest.h"
#include "../errors/JanbhashaErrors.h"

#include <memory>
#include <string>
#include <atomic>
#include <mutex>

namespace janbhasha {

struct EngineConfig {
    std::string modelsBasePath;   // absolute path to models/ dir on device
    std::string manifestPath;     // absolute path to model_manifest.json
    std::string cacheDir;         // absolute path for temp files (WAV, etc.)
    bool enableMemoryPolling = true;
    uint32_t memoryPollIntervalMs = 8000;
};

/**
 * JanbhashaNativeEngine
 *
 * The single object that the JSI bridge holds. Owns:
 *   - ModelManager  (model lifecycle)
 *   - MemoryManager (RAM tracking)
 *   - AudioManager  (AAudio recording/playback)
 *   - PipelineManager (ASR→NMT→TTS worker)
 *
 * RAII: all subsystems are initialized in initialize() and torn down
 * in the destructor (or release()). No resource leaks on exception.
 *
 * THREAD SAFETY: initialize() and release() must be called from the
 * JSI install thread. Pipeline execution happens on the worker thread.
 * Memory polling happens on its own background thread.
 */
class JanbhashaNativeEngine {
public:
    JanbhashaNativeEngine() = default;
    ~JanbhashaNativeEngine() { release(); }

    // Non-copyable, movable
    JanbhashaNativeEngine(const JanbhashaNativeEngine&) = delete;
    JanbhashaNativeEngine& operator=(const JanbhashaNativeEngine&) = delete;

    // Initialize all subsystems. Throws JanbhashaError on failure.
    void initialize(const EngineConfig& config);

    // Release all subsystems (idempotent).
    void release();

    bool isInitialized() const { return initialized_.load(); }

    // ---- Direct accessors (used by JSI bridge) ----------------------
    ModelManager&   modelManager();
    MemoryManager&  memoryManager();
    AudioManager&   audioManager();
    PipelineManager& pipelineManager();
    const LanguageConfig& languageConfig() const;

    const EngineConfig& config() const { return config_; }

private:
    EngineConfig config_;
    std::atomic<bool> initialized_{false};
    std::mutex initMutex_;

    std::unique_ptr<ModelManager>   modelManager_;
    std::unique_ptr<AudioManager>   audioManager_;
    std::unique_ptr<PipelineManager> pipelineManager_;
};

} // namespace janbhasha
