// ============================================================
// JanbhashaErrors.h
// Structured error system for the Janbhasha native C++ engine.
// All error codes are stable integers; NEVER renumber existing codes.
// ============================================================
#pragma once

#include <string>
#include <stdexcept>
#include <cstdint>

namespace janbhasha {

// ---- Error codes ---------------------------------------------------
enum class ErrorCode : int32_t {
    // Generic
    OK                         = 0,
    UNKNOWN                    = 1,
    INVALID_ARGUMENT           = 2,
    NOT_INITIALIZED            = 3,
    ALREADY_INITIALIZED        = 4,
    OPERATION_CANCELLED        = 5,
    TIMEOUT                    = 6,

    // Memory
    OOM_PREVENTED              = 100,
    MEMORY_BUDGET_EXCEEDED     = 101,
    MEMORY_STATS_UNAVAILABLE   = 102,

    // Model
    MODEL_NOT_FOUND            = 200,
    MODEL_CHECKSUM_MISMATCH    = 201,
    MODEL_LOAD_FAILED          = 202,
    MODEL_ALREADY_LOADED       = 203,
    MODEL_NOT_LOADED           = 204,
    MODEL_UNLOAD_FAILED        = 205,
    MODEL_MANIFEST_INVALID     = 206,

    // ASR
    ASR_INIT_FAILED            = 300,
    ASR_TRANSCRIPTION_FAILED   = 301,
    ASR_EMPTY_AUDIO            = 302,
    ASR_AUDIO_TOO_SHORT        = 303,

    // Translation
    NMT_INIT_FAILED            = 400,
    NMT_INFERENCE_FAILED       = 401,
    NMT_UNSUPPORTED_PAIR       = 402,
    NMT_EMPTY_INPUT            = 403,

    // TTS
    TTS_INIT_FAILED            = 500,
    TTS_SYNTHESIS_FAILED       = 501,
    TTS_UNSUPPORTED_LANGUAGE   = 502,
    TTS_EMPTY_INPUT            = 503,
    TTS_OUTPUT_WRITE_FAILED    = 504,

    // Audio I/O
    AUDIO_RECORD_INIT_FAILED   = 600,
    AUDIO_RECORD_START_FAILED  = 601,
    AUDIO_RECORD_STOP_FAILED   = 602,
    AUDIO_PLAYBACK_FAILED      = 603,
    AUDIO_FILE_WRITE_FAILED    = 604,
    AUDIO_FORMAT_UNSUPPORTED   = 605,

    // Pipeline
    PIPELINE_INIT_FAILED       = 700,
    PIPELINE_ALREADY_RUNNING   = 701,
    PIPELINE_NOT_RUNNING       = 702,
};

// ---- JanbhashaError ------------------------------------------------
/**
 * Runtime exception carrying an ErrorCode + human-readable message.
 * Thrown exclusively within native C++ code; translated to JSI error
 * in JanbhashaJSIHostObject before crossing into JS.
 */
class JanbhashaError : public std::runtime_error {
public:
    explicit JanbhashaError(ErrorCode code, const std::string& message)
        : std::runtime_error(message), code_(code) {}

    ErrorCode code() const noexcept { return code_; }

    int32_t codeInt() const noexcept {
        return static_cast<int32_t>(code_);
    }

private:
    ErrorCode code_;
};

// ---- Convenience helpers -------------------------------------------
inline void throwIf(bool condition, ErrorCode code, const std::string& msg) {
    if (condition) throw JanbhashaError(code, msg);
}

inline std::string errorCodeToString(ErrorCode code) {
    switch (code) {
        case ErrorCode::OK:                       return "OK";
        case ErrorCode::UNKNOWN:                  return "UNKNOWN";
        case ErrorCode::INVALID_ARGUMENT:         return "INVALID_ARGUMENT";
        case ErrorCode::NOT_INITIALIZED:          return "NOT_INITIALIZED";
        case ErrorCode::ALREADY_INITIALIZED:      return "ALREADY_INITIALIZED";
        case ErrorCode::OPERATION_CANCELLED:      return "OPERATION_CANCELLED";
        case ErrorCode::TIMEOUT:                  return "TIMEOUT";
        case ErrorCode::OOM_PREVENTED:            return "OOM_PREVENTED";
        case ErrorCode::MEMORY_BUDGET_EXCEEDED:   return "MEMORY_BUDGET_EXCEEDED";
        case ErrorCode::MEMORY_STATS_UNAVAILABLE: return "MEMORY_STATS_UNAVAILABLE";
        case ErrorCode::MODEL_NOT_FOUND:          return "MODEL_NOT_FOUND";
        case ErrorCode::MODEL_CHECKSUM_MISMATCH:  return "MODEL_CHECKSUM_MISMATCH";
        case ErrorCode::MODEL_LOAD_FAILED:        return "MODEL_LOAD_FAILED";
        case ErrorCode::MODEL_ALREADY_LOADED:     return "MODEL_ALREADY_LOADED";
        case ErrorCode::MODEL_NOT_LOADED:         return "MODEL_NOT_LOADED";
        case ErrorCode::MODEL_UNLOAD_FAILED:      return "MODEL_UNLOAD_FAILED";
        case ErrorCode::MODEL_MANIFEST_INVALID:   return "MODEL_MANIFEST_INVALID";
        case ErrorCode::ASR_INIT_FAILED:          return "ASR_INIT_FAILED";
        case ErrorCode::ASR_TRANSCRIPTION_FAILED: return "ASR_TRANSCRIPTION_FAILED";
        case ErrorCode::ASR_EMPTY_AUDIO:          return "ASR_EMPTY_AUDIO";
        case ErrorCode::ASR_AUDIO_TOO_SHORT:      return "ASR_AUDIO_TOO_SHORT";
        case ErrorCode::NMT_INIT_FAILED:          return "NMT_INIT_FAILED";
        case ErrorCode::NMT_INFERENCE_FAILED:     return "NMT_INFERENCE_FAILED";
        case ErrorCode::NMT_UNSUPPORTED_PAIR:     return "NMT_UNSUPPORTED_PAIR";
        case ErrorCode::NMT_EMPTY_INPUT:          return "NMT_EMPTY_INPUT";
        case ErrorCode::TTS_INIT_FAILED:          return "TTS_INIT_FAILED";
        case ErrorCode::TTS_SYNTHESIS_FAILED:     return "TTS_SYNTHESIS_FAILED";
        case ErrorCode::TTS_UNSUPPORTED_LANGUAGE: return "TTS_UNSUPPORTED_LANGUAGE";
        case ErrorCode::TTS_EMPTY_INPUT:          return "TTS_EMPTY_INPUT";
        case ErrorCode::TTS_OUTPUT_WRITE_FAILED:  return "TTS_OUTPUT_WRITE_FAILED";
        case ErrorCode::AUDIO_RECORD_INIT_FAILED: return "AUDIO_RECORD_INIT_FAILED";
        case ErrorCode::AUDIO_RECORD_START_FAILED:return "AUDIO_RECORD_START_FAILED";
        case ErrorCode::AUDIO_RECORD_STOP_FAILED: return "AUDIO_RECORD_STOP_FAILED";
        case ErrorCode::AUDIO_PLAYBACK_FAILED:    return "AUDIO_PLAYBACK_FAILED";
        case ErrorCode::AUDIO_FILE_WRITE_FAILED:  return "AUDIO_FILE_WRITE_FAILED";
        case ErrorCode::AUDIO_FORMAT_UNSUPPORTED: return "AUDIO_FORMAT_UNSUPPORTED";
        case ErrorCode::PIPELINE_INIT_FAILED:     return "PIPELINE_INIT_FAILED";
        case ErrorCode::PIPELINE_ALREADY_RUNNING: return "PIPELINE_ALREADY_RUNNING";
        case ErrorCode::PIPELINE_NOT_RUNNING:     return "PIPELINE_NOT_RUNNING";
        default:                                  return "UNKNOWN_CODE";
    }
}

} // namespace janbhasha
