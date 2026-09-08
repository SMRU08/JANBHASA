// ============================================================
// VITSTTSEngine.cpp
// VITS ONNX Runtime inference — FP32 only.
// ============================================================
#include "VITSTTSEngine.h"
#include "../errors/JanbhashaErrors.h"

#ifdef HAVE_ONNXRUNTIME
#include <onnxruntime_cxx_api.h>
#endif

#include <fstream>
#include <cstring>
#include <cstdint>
#include <chrono>
#include <android/log.h>

#define LOG_TAG "JanbhashaTTS"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO,  LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

namespace janbhasha {

VITSTTSEngine::~VITSTTSEngine() {
    release();
}

void VITSTTSEngine::initialize(const std::string& modelPath) {
    throwIf(initialized_.load(), ErrorCode::MODEL_ALREADY_LOADED,
            "VITSTTSEngine already initialized. Call release() first.");

    modelPath_ = modelPath;

    std::ifstream modelCheck(modelPath + "/model.onnx");
    throwIf(!modelCheck.is_open(), ErrorCode::MODEL_NOT_FOUND,
            "VITS model not found: " + modelPath + "/model.onnx");

    LOGI("VITSTTSEngine: loading from %s", modelPath.c_str());

#ifdef HAVE_ONNXRUNTIME
    auto* env = new Ort::Env(ORT_LOGGING_LEVEL_WARNING, "JanbhashaTTS");
    Ort::SessionOptions opts;
    opts.SetIntraOpNumThreads(1); // TTS is single-threaded by design
    opts.SetGraphOptimizationLevel(GraphOptimizationLevel::ORT_ENABLE_ALL);
    // IMPORTANT: do NOT add quantization opts — model must stay FP32

    std::string modelOnnxPath = modelPath + "/model.onnx";
    auto* session = new Ort::Session(*env, modelOnnxPath.c_str(), opts);

    ortEnv_     = static_cast<void*>(env);
    ortSession_ = static_cast<void*>(session);

    // Read sample rate from config.json
    std::ifstream cfg(modelPath + "/config.json");
    if (cfg.is_open()) {
        std::string json((std::istreambuf_iterator<char>(cfg)), {});
        auto sr_pos = json.find("\"sample_rate\"");
        if (sr_pos != std::string::npos) {
            auto colon = json.find(':', sr_pos);
            if (colon != std::string::npos) {
                modelSampleRate_ = static_cast<uint32_t>(std::stoul(json.substr(colon + 1)));
            }
        }
    }
    LOGI("VITSTTSEngine: ONNX Runtime native session initialized");
#else
    LOGI("VITSTTSEngine: compiled in stub mode (place libonnxruntime.so in android/app/libs to enable)");
#endif

    initialized_.store(true);
    LOGI("VITSTTSEngine: initialized OK (sampleRate=%u)", modelSampleRate_);
}

void VITSTTSEngine::addSupportedLanguage(const std::string& langCode) {
    supportedLanguages_.insert(langCode);
}

bool VITSTTSEngine::supportsLanguage(const std::string& langCode) const {
    return supportedLanguages_.count(langCode) > 0;
}

std::vector<int64_t> VITSTTSEngine::tokenize(const std::string& text,
                                               const std::string& /*langCode*/) const {
    // Character-level tokenization for MMS-TTS.
    // In production, load tokenizer.json and map chars → IDs.
    // Simplified: use raw Unicode codepoint values as token IDs.
    std::vector<int64_t> tokens;
    const uint8_t* bytes = reinterpret_cast<const uint8_t*>(text.data());
    size_t i = 0;
    while (i < text.size()) {
        uint32_t codepoint = 0;
        uint8_t b = bytes[i];
        if (b < 0x80) {
            codepoint = b;
            i += 1;
        } else if ((b & 0xE0) == 0xC0) {
            codepoint = (b & 0x1F);
            if (i + 1 < text.size()) codepoint = (codepoint << 6) | (bytes[++i] & 0x3F);
            i++;
        } else if ((b & 0xF0) == 0xE0) {
            codepoint = (b & 0x0F);
            if (i + 1 < text.size()) codepoint = (codepoint << 6) | (bytes[++i] & 0x3F);
            if (i + 1 < text.size()) codepoint = (codepoint << 6) | (bytes[++i] & 0x3F);
            i++;
        } else {
            i++;
        }
        tokens.push_back(static_cast<int64_t>(codepoint));
    }
    return tokens;
}

bool VITSTTSEngine::writeWavFile(const std::string& path,
                                  const std::vector<float>& samples,
                                  uint32_t sampleRate) {
    // Write standard 44-byte RIFF/WAV header + float32 PCM data.
    std::ofstream f(path, std::ios::binary | std::ios::trunc);
    if (!f.is_open()) return false;

    uint32_t numChannels    = 1;
    uint32_t bitsPerSample  = 32;
    uint32_t byteRate       = sampleRate * numChannels * (bitsPerSample / 8);
    uint32_t blockAlign     = numChannels * (bitsPerSample / 8);
    uint32_t dataSize       = static_cast<uint32_t>(samples.size()) * sizeof(float);
    uint32_t chunkSize      = 36 + dataSize;

    // "RIFF"
    f.write("RIFF", 4);
    f.write(reinterpret_cast<const char*>(&chunkSize), 4);
    f.write("WAVE", 4);
    // "fmt " subchunk
    f.write("fmt ", 4);
    uint32_t subchunk1Size = 16;
    f.write(reinterpret_cast<const char*>(&subchunk1Size), 4);
    uint16_t audioFormat = 3; // IEEE float
    f.write(reinterpret_cast<const char*>(&audioFormat), 2);
    uint16_t nc = static_cast<uint16_t>(numChannels);
    f.write(reinterpret_cast<const char*>(&nc), 2);
    f.write(reinterpret_cast<const char*>(&sampleRate), 4);
    f.write(reinterpret_cast<const char*>(&byteRate), 4);
    uint16_t ba = static_cast<uint16_t>(blockAlign);
    f.write(reinterpret_cast<const char*>(&ba), 2);
    uint16_t bps = static_cast<uint16_t>(bitsPerSample);
    f.write(reinterpret_cast<const char*>(&bps), 2);
    // "data" subchunk
    f.write("data", 4);
    f.write(reinterpret_cast<const char*>(&dataSize), 4);
    f.write(reinterpret_cast<const char*>(samples.data()), dataSize);

    return static_cast<bool>(f);
}

TTSSynthesisResult VITSTTSEngine::synthesize(const TTSInput& input,
                                              const std::string& outputPath) {
    throwIf(!initialized_.load(), ErrorCode::NOT_INITIALIZED,
            "VITSTTSEngine not initialized");
    throwIf(input.text.empty(), ErrorCode::TTS_EMPTY_INPUT,
            "TTS input text is empty");
    throwIf(!supportsLanguage(input.language), ErrorCode::TTS_UNSUPPORTED_LANGUAGE,
            "TTS does not support language: " + input.language);

    auto t0 = std::chrono::steady_clock::now();

    auto tokenIds = tokenize(input.text, input.language);

    LOGI("VITSTTSEngine: synthesize() lang=%s, %zu tokens, outputPath=%s",
         input.language.c_str(), tokenIds.size(), outputPath.c_str());

#ifdef HAVE_ONNXRUNTIME
    auto* session = static_cast<Ort::Session*>(ortSession_);
    Ort::AllocatorWithDefaultOptions allocator;
    Ort::MemoryInfo memInfo = Ort::MemoryInfo::CreateCpu(OrtArenaAllocator, OrtMemTypeDefault);

    int64_t tokenLen = static_cast<int64_t>(tokenIds.size());
    std::array<int64_t,2> inputShape = {1, tokenLen};
    auto inputTensor = Ort::Value::CreateTensor<int64_t>(
        memInfo, tokenIds.data(), tokenIds.size(), inputShape.data(), 2);

    const char* inputNames[]  = {"input"};
    const char* outputNames[] = {"output"};
    auto outputTensors = session->Run(
        Ort::RunOptions{nullptr}, inputNames, &inputTensor, 1, outputNames, 1);

    float* audioData = outputTensors[0].GetTensorMutableData<float>();
    size_t numSamples = outputTensors[0].GetTensorTypeAndShapeInfo().GetElementCount();
    std::vector<float> waveform(audioData, audioData + numSamples);

    bool wrote = writeWavFile(outputPath, waveform, modelSampleRate_);
    throwIf(!wrote, ErrorCode::TTS_OUTPUT_WRITE_FAILED,
            "Failed to write WAV to: " + outputPath);

    auto t1 = std::chrono::steady_clock::now();
    int64_t latencyMs = std::chrono::duration_cast<std::chrono::milliseconds>(t1 - t0).count();

    TTSSynthesisResult result;
    result.outputFilePath = outputPath;
    result.durationMs     = static_cast<int64_t>(numSamples) * 1000 / modelSampleRate_;
    result.sampleRate     = modelSampleRate_;
    result.numChannels    = 1;
    return result;
#else
    auto t1 = std::chrono::steady_clock::now();
    int64_t latencyMs = std::chrono::duration_cast<std::chrono::milliseconds>(t1 - t0).count();

    // Development stub — write a minimal valid silent WAV.
    std::vector<float> silentSamples(modelSampleRate_, 0.0f); // 1 second silence
    bool wrote = writeWavFile(outputPath, silentSamples, modelSampleRate_);
    throwIf(!wrote, ErrorCode::TTS_OUTPUT_WRITE_FAILED,
            "Failed to write stub WAV to: " + outputPath);

    TTSSynthesisResult result;
    result.outputFilePath = outputPath;
    result.durationMs     = 1000; // stub: 1 second
    result.sampleRate     = modelSampleRate_;
    result.numChannels    = 1;
    return result;
#endif
}

void VITSTTSEngine::release() {
    if (!initialized_.load()) return;

#ifdef HAVE_ONNXRUNTIME
    if (ortSession_) { delete static_cast<Ort::Session*>(ortSession_); ortSession_ = nullptr; }
    if (ortEnv_)     { delete static_cast<Ort::Env*>(ortEnv_);         ortEnv_ = nullptr;     }
#endif

    initialized_.store(false);
    LOGI("VITSTTSEngine: released");
}

} // namespace janbhasha
