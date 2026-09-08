// ============================================================
// PipelineManager.cpp
// ============================================================
#include "PipelineManager.h"

#include <chrono>
#include <stdexcept>
#include <android/log.h>
#include <cstdio>
#include <ctime>

#define LOG_TAG "JanbhashaPipeline"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO,  LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

namespace janbhasha {

// ---- Constructor / Destructor --------------------------------------

PipelineManager::PipelineManager(ModelManager& modelManager,
                                  AudioManager& audioManager,
                                  const std::string& cacheDir)
    : modelManager_(modelManager)
    , audioManager_(audioManager)
    , cacheDir_(cacheDir)
{}

PipelineManager::~PipelineManager() {
    shutdown();
}

void PipelineManager::start() {
    if (workerRunning_.exchange(true)) return;
    workerThread_ = std::thread(&PipelineManager::workerLoop, this);
    LOGI("PipelineManager: worker thread started");
}

void PipelineManager::shutdown() {
    workerRunning_.store(false);
    cancelRequested_.store(true);
    queueCv_.notify_all();
    if (workerThread_.joinable()) workerThread_.join();
    LOGI("PipelineManager: worker thread stopped");
}

void PipelineManager::cancel() {
    cancelRequested_.store(true);
    LOGI("PipelineManager: cancel requested");
}

// ---- Task submission -----------------------------------------------

std::future<PipelineResult> PipelineManager::submit(const PipelineInput& input) {
    throwIf(!workerRunning_.load(), ErrorCode::PIPELINE_INIT_FAILED,
            "PipelineManager not started. Call start() first.");
    throwIf(busy_.load(), ErrorCode::PIPELINE_ALREADY_RUNNING,
            "A pipeline job is already in progress. Cancel it first.");

    Task task;
    task.input = input;
    auto future = task.promise.get_future();

    {
        std::lock_guard<std::mutex> lk(queueMutex_);
        cancelRequested_.store(false);
        taskQueue_.push(std::move(task));
    }
    queueCv_.notify_one();
    return future;
}

// ---- Worker loop ---------------------------------------------------

void PipelineManager::workerLoop() {
    while (workerRunning_.load()) {
        Task task;
        {
            std::unique_lock<std::mutex> lk(queueMutex_);
            queueCv_.wait(lk, [this] {
                return !taskQueue_.empty() || !workerRunning_.load();
            });
            if (!workerRunning_.load()) break;
            if (taskQueue_.empty()) continue;
            task = std::move(taskQueue_.front());
            taskQueue_.pop();
        }

        busy_.store(true);
        LOGI("PipelineManager: starting pipeline job");

        try {
            PipelineResult result = runPipeline(task.input, cancelRequested_);
            task.promise.set_value(result);
        } catch (...) {
            try { task.promise.set_exception(std::current_exception()); }
            catch (...) {}
        }

        busy_.store(false);
        LOGI("PipelineManager: pipeline job complete");
    }
}

// ---- Pipeline stages -----------------------------------------------

PipelineResult PipelineManager::runPipeline(const PipelineInput& input,
                                              std::atomic<bool>& cancelled) {
    PipelineResult result;
    auto totalStart = std::chrono::steady_clock::now();

    // Validate language pair
    const auto& langCfg = LanguageConfig::instance();
    auto pair = langCfg.findPair(input.sourceLanguage, input.sourceScript,
                                  input.targetLanguage, input.targetScript);
    throwIf(!pair.has_value(), ErrorCode::NMT_UNSUPPORTED_PAIR,
            "Unsupported language pair: " + input.sourceLanguage +
            "_" + input.sourceScript + " -> " +
            input.targetLanguage + "_" + input.targetScript);

    // ================================================================
    // STAGE 1: ASR
    // ================================================================
    LOGI("PipelineManager: Stage 1 — ASR");
    {
        modelManager_.loadASR(pair->asrModelId, input.sourceLanguage);
        auto* asr = modelManager_.asrEngine();
        throwIf(!asr, ErrorCode::ASR_INIT_FAILED, "ASR engine unavailable after load");

        auto t0 = std::chrono::steady_clock::now();
        auto asrResult = asr->transcribeFile(input.audioFileUri, input.sourceLanguage);
        auto t1 = std::chrono::steady_clock::now();

        result.originalTranscript = asrResult.transcript;
        result.asrLatencyMs = std::chrono::duration_cast<std::chrono::milliseconds>(t1 - t0).count();

        modelManager_.unloadASR();
    }

    throwIf(cancelled.load(), ErrorCode::OPERATION_CANCELLED,
            "Pipeline cancelled after ASR stage");

    // ================================================================
    // STAGE 2: NMT
    // ================================================================
    LOGI("PipelineManager: Stage 2 — NMT");
    {
        modelManager_.loadNMT(pair->nmtModelId);
        auto* nmt = modelManager_.nmtEngine();
        throwIf(!nmt, ErrorCode::NMT_INIT_FAILED, "NMT engine unavailable after load");

        TranslationInput nmtInput;
        nmtInput.text           = result.originalTranscript;
        nmtInput.sourceLanguage = input.sourceLanguage;
        nmtInput.sourceScript   = input.sourceScript;
        nmtInput.targetLanguage = input.targetLanguage;
        nmtInput.targetScript   = input.targetScript;

        auto t0 = std::chrono::steady_clock::now();
        auto nmtResult = nmt->translate(nmtInput);
        auto t1 = std::chrono::steady_clock::now();

        result.translatedText = nmtResult.translatedText;
        result.nmtLatencyMs   = std::chrono::duration_cast<std::chrono::milliseconds>(t1 - t0).count();

        modelManager_.unloadNMT();
    }

    throwIf(cancelled.load(), ErrorCode::OPERATION_CANCELLED,
            "Pipeline cancelled after NMT stage");

    // ================================================================
    // STAGE 3: TTS (optional)
    // ================================================================
    if (input.synthesizeSpeech) {
        LOGI("PipelineManager: Stage 3 — TTS");
        throwIf(!pair->hasTts || pair->ttsModelId.empty(), ErrorCode::TTS_UNSUPPORTED_LANGUAGE,
                "TTS is unavailable on device for target language: " + input.targetLanguage +
                " (Santali TTS model exists in AI4Bharat Indic Parler-TTS, but native Android deployment on 2GB RAM devices is currently blocked due to model size and lack of mobile runtime)");

        modelManager_.loadTTS(pair->ttsModelId, input.targetLanguage);
        auto* tts = modelManager_.ttsEngine();
        throwIf(!tts, ErrorCode::TTS_INIT_FAILED, "TTS engine unavailable after load");

        // Generate output filename in cache dir
        char fname[512];
        auto now = std::chrono::system_clock::now().time_since_epoch().count();
        snprintf(fname, sizeof(fname), "%s/tts_%lld.wav",
                 cacheDir_.c_str(), static_cast<long long>(now));

        TTSInput ttsInput;
        ttsInput.text     = result.translatedText;
        ttsInput.language = input.targetLanguage;
        ttsInput.script   = input.targetScript;

        auto t0 = std::chrono::steady_clock::now();
        auto ttsResult = tts->synthesize(ttsInput, std::string(fname));
        auto t1 = std::chrono::steady_clock::now();

        result.outputAudioUri = "file://" + std::string(fname);
        result.ttsLatencyMs   = std::chrono::duration_cast<std::chrono::milliseconds>(t1 - t0).count();

        modelManager_.unloadTTS();
    }

    auto totalEnd = std::chrono::steady_clock::now();
    result.totalLatencyMs = std::chrono::duration_cast<std::chrono::milliseconds>(
        totalEnd - totalStart).count();

    LOGI("PipelineManager: pipeline complete. ASR=%lldms NMT=%lldms TTS=%lldms Total=%lldms",
         (long long)result.asrLatencyMs, (long long)result.nmtLatencyMs,
         (long long)result.ttsLatencyMs, (long long)result.totalLatencyMs);

    return result;
}

} // namespace janbhasha
