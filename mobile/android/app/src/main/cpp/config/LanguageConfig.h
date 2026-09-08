// ============================================================
// LanguageConfig.h
// Language pair registry for Janbhasha native engine.
// NEVER hardcode specific pairs (e.g., Hindi→Santhali).
// All routing is table-driven. Add pairs to the registry only.
// ============================================================
#pragma once

#include <string>
#include <vector>
#include <unordered_map>
#include <optional>

namespace janbhasha {

// ---- Primitive types -----------------------------------------------

/**
 * BCP-47 language tag subset.
 * Supported: "hi", "sat", "hoc", "unr"
 */
using LanguageCode = std::string;

/**
 * ISO 15924 script code.
 * Supported: "Deva", "Olck", "Wara", "Latn"
 */
using ScriptCode = std::string;

// ---- Data structures -----------------------------------------------

struct LanguageDescriptor {
    LanguageCode code;        // e.g., "sat"
    std::string nameEn;       // "Santali"
    std::string nameNative;   // ᱥᱟᱱᱛᱟᱲᱤ
    ScriptCode defaultScript;
};

struct LanguagePair {
    std::string id;           // e.g., "hi_Deva-sat_Olck"
    LanguageCode sourceLang;
    ScriptCode sourceScript;
    LanguageCode targetLang;
    ScriptCode targetScript;
    std::string nmtModelId;   // matches ModelManifest entry
    std::string asrModelId;
    std::string ttsModelId;   // empty string if TTS is unavailable
    bool isAvailableOffline;
    bool hasTts;
};

// ---- LanguageConfig singleton --------------------------------------

class LanguageConfig {
public:
    static LanguageConfig& instance() {
        static LanguageConfig singleton;
        return singleton;
    }

    const std::vector<LanguagePair>& supportedPairs() const {
        return pairs_;
    }

    std::optional<LanguagePair> findPair(
        const LanguageCode& src, const ScriptCode& srcScript,
        const LanguageCode& tgt, const ScriptCode& tgtScript) const
    {
        for (const auto& p : pairs_) {
            if (p.sourceLang == src && p.sourceScript == srcScript &&
                p.targetLang == tgt && p.targetScript == tgtScript) {
                return p;
            }
        }
        return std::nullopt;
    }

    bool isSupported(const LanguageCode& src, const LanguageCode& tgt) const {
        for (const auto& p : pairs_) {
            if (p.sourceLang == src && p.targetLang == tgt) return true;
        }
        return false;
    }

    const std::unordered_map<LanguageCode, LanguageDescriptor>& languages() const {
        return languages_;
    }

private:
    LanguageConfig() { buildRegistry(); }
    LanguageConfig(const LanguageConfig&) = delete;
    LanguageConfig& operator=(const LanguageConfig&) = delete;

    void buildRegistry() {
        // ---- Language descriptors ----------------------------------
        languages_["hi"]  = {"hi",  "Hindi",   "\xe0\xa4\xb9\xe0\xa4\xbf\xe0\xa4\xa8\xe0\xa5\x8d\xe0\xa4\xa6\xe0\xa5\x80", "Deva"};
        languages_["sat"] = {"sat", "Santali", "\xe1\xb1\xa5\xe1\xb1\x9f\xe1\xb1\xb1\xe1\xb1\x9b\xe1\xb1\xb2\xe1\xb1\xa4", "Olck"};
        languages_["hoc"] = {"hoc", "Ho",      "Ho",      "Wara"};
        languages_["unr"] = {"unr", "Mundari",  "Mundari", "Latn"};

        // ---- Language pairs ----------------------------------------
        // STRICT RULES & MODEL VALIDATION:
        // - Do NOT substitute Ho TTS (vits_hoc) for Santali. sat != hoc.
        // - Santali TTS model EXISTS: AI4Bharat Indic Parler-TTS (ai4bharat/indic-parler-tts)
        //   officially supports Santali (298.19 hours of speech in pretraining data).
        // - Native mobile runtime on ~2 GB RAM Android hardware is BLOCKED:
        //   938M parameters (~1.88 GB FP16) exceeds device memory budget;
        //   no official mobile ONNX / C++ runtime exists for Parler-TTS autoregressive loop.
        // - IndicParlerTTSEngine adapter interface is registered for future quantized deployment.
        // - ttsModelId is set to "indic_parler_tts_sat", but hasTts is false on 2GB devices.
        pairs_.push_back({
            "hi_Deva-sat_Olck",
            "hi", "Deva", "sat", "Olck",
            "indictrans2_indic_indic", // NMT model ID (gated AI4Bharat)
            "whisper_small_indic",     // ASR model ID
            "indic_parler_tts_sat",    // TTS model ID: AI4Bharat Indic Parler-TTS (blocked on 2GB mobile)
            false,                     // isAvailableOffline: blocked until models converted/provisioned
            false                      // hasTts: false on 2GB mobile target (pending mobile runtime)
        });
        pairs_.push_back({
            "hi_Deva-hoc_Orya",
            "hi", "Deva", "hoc", "Orya",
            "indictrans2_indic_indic",
            "whisper_small_indic",
            "vits_hoc",                // Meta MMS Ho (Odia script)
            false,                     // isAvailableOffline: NMT blocked
            true                       // hasTts: true
        });
        pairs_.push_back({
            "hi_Deva-unr_Latn",
            "hi", "Deva", "unr", "Latn",
            "indictrans2_indic_indic",
            "whisper_small_indic",
            "vits_unr",                // Meta MMS Mundari
            false,                     // isAvailableOffline: NMT blocked
            true                       // hasTts: true
        });
    }

    std::vector<LanguagePair> pairs_;
    std::unordered_map<LanguageCode, LanguageDescriptor> languages_;
};

} // namespace janbhasha
