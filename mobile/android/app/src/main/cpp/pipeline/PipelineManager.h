// ============================================================
// PipelineManager.h
// ASR → NMT → TTS orchestrator with task queue + cancellation.
// ============================================================
#pragma once

#include "../engine/ModelManager.h"
#include "../audio/AudioManager.h"
#include "../errors/JanbhashaErrors.h"
#include "../config/LanguageConfig.h"

#include <functional>
#include <future>
#include <atomic>
#include <mutex>
#include <string>
#include <memory>
#include <thread>
#include <queue>
#include <condition_variable>

namespace janbhasha {

struct PipelineInput {
    std::string audioFileUri;         // file:// URI to input WAV
    std::string sourceLanguage;       // BCP-47
    std::string sourceScript;         // ISO 15924
    std::string targetLanguage;
    std::string targetScript;
    bool synthesizeSpeech = true;
};

struct PipelineResult {
    std::string originalTranscript;
    std::string translatedText;
    std::string outputAudioUri;       // file:// URI — empty if synthesizeSpeech=false
    int64_t asrLatencyMs    = 0;
    int64_t nmtLatencyMs    = 0;
    int64_t ttsLatencyMs    = 0;
    int64_t totalLatencyMs  = 0;
};

/**
 * PipelineManager
 *
 * Runs the full ASR → NMT → TTS pipeline on a dedicated worker thread.
 * Uses sequential model loading — only one model is in memory at a time.
 *
 * THREADING MODEL:
 *   - JS calls submit() on the Hermes thread (JSI callback).
 *   - submit() enqueues a task and returns a future immediately.
 *   - Worker thread dequeues and executes the pipeline serially.
 *   - The future is resolved when the pipeline completes.
 *   - cancel() signals the worker to abort between pipeline stages.
 *
 * CANCELLATION:
 *   cancel() sets a flag checked at each stage boundary:
 *     ASR done? → check cancel → NMT → check cancel → TTS → done.
 *   No in-flight inference is interrupted (CTranslate2/ONNX do not
 *   support mid-inference cancellation). Cancel applies between stages.
 */
class PipelineManager {
public:
    using ResultCallback = std::function<void(const PipelineResult&)>;
    using ErrorCallback  = std::function<void(ErrorCode, const std::string&)>;

    explicit PipelineManager(ModelManager& modelManager,
                              AudioManager& audioManager,
                              const std::string& cacheDir);

    ~PipelineManager();

    // Non-copyable
    PipelineManager(const PipelineManager&) = delete;
    PipelineManager& operator=(const PipelineManager&) = delete;

    // Start the background worker thread.
    void start();

    // Shutdown the worker thread gracefully.
    void shutdown();

    // Submit a pipeline job. Returns a future that resolves with PipelineResult.
    // Throws immediately if a job is already queued (one-at-a-time policy).
    std::future<PipelineResult> submit(const PipelineInput& input);

    // Cancel the pending or in-progress pipeline job.
    // Takes effect at the next stage boundary.
    void cancel();

    bool isRunning() const { return workerRunning_.load(); }
    bool isBusy()    const { return busy_.load(); }

private:
    void workerLoop();

    PipelineResult runPipeline(const PipelineInput& input,
                                std::atomic<bool>& cancelled);

    ModelManager& modelManager_;
    AudioManager& audioManager_;
    std::string   cacheDir_;

    std::thread workerThread_;
    std::atomic<bool> workerRunning_{false};
    std::atomic<bool> busy_{false};
    std::atomic<bool> cancelRequested_{false};

    std::mutex              queueMutex_;
    std::condition_variable queueCv_;

    struct Task {
        PipelineInput              input;
        std::promise<PipelineResult> promise;
    };

    std::queue<Task> taskQueue_;
};

} // namespace janbhasha
