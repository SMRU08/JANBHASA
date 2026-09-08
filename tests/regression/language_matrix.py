# Janbhasha — Phase 9 Language Pair Test Matrix
#
# STRICT RULE:
#   - sat != hoc. Never substitute Ho TTS for Santali TTS.
#   - Only mark a pair PASS when ALL of these are true:
#       1. A real trained model exists and is downloaded
#       2. At least 10 sentence pairs were translated
#       3. Human speaker reviewed the output
#       4. TTS audio was synthesized and played back
#
# Legend:
#   PASS       - all 4 criteria met on real device
#   FAIL       - model exists but output is incorrect/unintelligible
#   NOT_TESTED - model not yet available or test not run
#   BLOCKED    - dependency missing (e.g., no TTS or NMT model for this language)

language_pair_matrix = {
    "meta": {
        "tested_at": "2026-09-08T10:28:00Z",
        "device": "NOT_TESTED",
        "android_version": "NOT_TESTED",
    },
    "matrix": [
        {
            "source_lang": "hi",
            "source_script": "Deva",
            "target_lang": "sat",
            "target_script": "Olck",
            "asr_model": "openai/whisper-small",
            "nmt_model": "ai4bharat/indictrans2-indic-indic-dist-320M",
            "tts_model": None,  # No verified offline Santali TTS model exists
            "asr_available": True,
            "nmt_available": False,  # Gated, weights not downloaded locally
            "tts_available": False,  # facebook/mms-tts-sat does not exist; Indic Parler-TTS is >2GB and requires Python/PyTorch
            "human_evaluated": False,
            "status": "BLOCKED",
            "bleu": None, "chrf": None, "wer": None,
            "latency_asr_ms": None, "latency_nmt_ms": None, "latency_tts_ms": None,
            "notes": "Santali TTS model missing: facebook/mms-tts-sat does not exist on HuggingFace Hub. "
                     "Ho TTS (facebook/mms-tts-hoc) MUST NOT be used as Santali fallback (sat != hoc). "
                     "NMT is blocked until AI4Bharat gated weights are downloaded. Status: BLOCKED."
        },
        {
            "source_lang": "hi",
            "source_script": "Deva",
            "target_lang": "hoc",
            "target_script": "Orya",
            "asr_model": "openai/whisper-small",
            "nmt_model": "ai4bharat/indictrans2-indic-indic-dist-320M",
            "tts_model": "facebook/mms-tts-hoc",
            "asr_available": True,
            "nmt_available": False,  # AI4Bharat IndicTrans2 does not officially list Ho as a target language
            "tts_available": True,   # Verified locally in PyTorch with Odia script
            "human_evaluated": False,
            "status": "BLOCKED",
            "bleu": None, "chrf": None, "wer": None,
            "latency_asr_ms": None, "latency_nmt_ms": None, "latency_tts_ms": None,
            "notes": "Ho TTS (facebook/mms-tts-hoc) is verified working with Odia script (Orya). "
                     "However, Hindi->Ho translation model is not present in local directory and not officially in IndicTrans2. Status: BLOCKED on NMT."
        },
        {
            "source_lang": "hi",
            "source_script": "Deva",
            "target_lang": "unr",
            "target_script": "Latn",
            "asr_model": "openai/whisper-small",
            "nmt_model": "ai4bharat/indictrans2-indic-indic-dist-320M",
            "tts_model": "facebook/mms-tts-unr",  # Exists on HuggingFace Hub
            "asr_available": True,
            "nmt_available": False,  # AI4Bharat IndicTrans2 does not officially list Mundari
            "tts_available": False,  # Exists on HF Hub, but not yet downloaded locally
            "human_evaluated": False,
            "status": "BLOCKED",
            "bleu": None, "chrf": None, "wer": None,
            "latency_asr_ms": None, "latency_nmt_ms": None, "latency_tts_ms": None,
            "notes": "facebook/mms-tts-unr exists on HuggingFace Hub (CC-BY-NC-4.0). "
                     "Hindi->Mundari translation is not supported by standard IndicTrans2. Status: BLOCKED on NMT."
        }
    ],
    "summary": {
        "total_pairs": 3,
        "pass": 0,
        "fail": 0,
        "not_tested": 0,
        "blocked": 3,
        "phase9_matrix_complete": False,
        "blockers": [
            "Hindi -> Santali: Blocked on Santali TTS (facebook/mms-tts-sat does not exist; Parler-TTS is infeasible for 2GB Android) and gated NMT.",
            "Hindi -> Ho: Blocked on NMT (no verified local Hindi->Ho model). TTS is verified for Ho in Odia script.",
            "Hindi -> Mundari: Blocked on NMT (no verified local Hindi->Mundari model). TTS exists on HF Hub but is not downloaded."
        ]
    }
}

if __name__ == "__main__":
    import json, sys
    if sys.platform == "win32":
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    print(json.dumps(language_pair_matrix, ensure_ascii=False, indent=2))
    print("\nLanguage Pair Summary:")
    for pair in language_pair_matrix["matrix"]:
        src = f"{pair['source_lang']}_{pair['source_script']}"
        tgt = f"{pair['target_lang']}_{pair['target_script']}"
        print(f"  {src} -> {tgt}: {pair['status']}")
        if pair["notes"]:
            print(f"    NOTE: {pair['notes']}")
