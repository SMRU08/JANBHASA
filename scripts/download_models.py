import sys
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass
#!/usr/bin/env python3
"""
Janbhasha Offline Model Download Helper.
Handles both public and gated (AI4Bharat) Hugging Face models.

Features:
 - Corrected Hugging Face repository IDs.
 - Supports HF_TOKEN from environment / .env file / interactive input.
 - Pre-configured with official AI4Bharat models and un-gated tribal open models.
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

def _ensure_huggingface_hub():
    """Install huggingface_hub if not present."""
    try:
        import huggingface_hub
        return True
    except ImportError:
        print("[!] Installing huggingface-hub for this session...")
        import subprocess
        subprocess.run([sys.executable, "-m", "pip", "install", "huggingface-hub>=0.22.0", "--quiet"])
        return True

_ensure_huggingface_hub()
from huggingface_hub import snapshot_download

MODEL_REGISTRY = {
    # -- 1. Speech Recognition (ASR) ------------------------------------------
    "asr_whisper_small": {
        "hf_id":     "openai/whisper-small",
        "local_dir": "models/asr/whisper-small-indic",
        "ignore":    ["*.msgpack", "*.h5", "flax_model*", "tf_model*"],
        "gated":     False,
        "note":      "Standard Whisper Small (244M). Fully open, no token required."
    },
    "asr_whisper_santali_olchiki": {
        "hf_id":     "thunderboltc/whisper-small-santali-ol-chiki",
        "local_dir": "models/asr/whisper-santali-olchiki",
        "ignore":    ["*.msgpack", "*.h5", "flax_model*"],
        "gated":     False,
        "note":      "Fine-tuned Whisper on Santhali Ol Chiki speech. Fully open."
    },

    # -- 2. Machine Translation (NMT) -----------------------------------------
    "translation_indictrans2_320M": {
        "hf_id":     "ai4bharat/indictrans2-indic-indic-dist-320M",
        "local_dir": "models/translation/indictrans2-indic-indic-dist-320M",
        "ignore":    ["*.msgpack", "*.h5", "flax_model*", "tf_model*", "rust_model*"],
        "gated":     True,
        "note":      "AI4Bharat Indic-to-Indic 320M distilled. Supports sat_Olck, hin_Deva. Requires free HF token."
    },
    "translation_indictrans2_en_indic_200M": {
        "hf_id":     "ai4bharat/indictrans2-en-indic-dist-200M",
        "local_dir": "models/translation/indictrans2-en-indic-dist-200M",
        "ignore":    ["*.msgpack", "*.h5", "flax_model*", "tf_model*"],
        "gated":     True,
        "note":      "AI4Bharat English-to-Indic 200M distilled. Requires free HF token."
    },
    "translation_santali_open": {
        "hf_id":     "aiswarya9302/indictrans2-en-santali",
        "local_dir": "models/translation/indictrans2-en-santali-open",
        "ignore":    ["*.msgpack", "*.h5", "flax_model*"],
        "gated":     False,
        "note":      "IndicTrans2 English-to-Santhali community model. No token needed."
    },

    # -- 3. Speech Synthesis (TTS) --------------------------------------------
    "tts_mms_ho": {
        "hf_id":     "facebook/mms-tts-hoc",
        "local_dir": "models/tts/vits-ho-mms",
        "ignore":    ["*.msgpack", "*.h5", "flax_model*"],
        "gated":     False,
        "note":      "Meta MMS-TTS for Ho language (closely related tribal Austroasiatic language). Open."
    },
    "tts_mms_hindi": {
        "hf_id":     "facebook/mms-tts-hin",
        "local_dir": "models/tts/vits-hindi-mms",
        "ignore":    ["*.msgpack", "*.h5", "flax_model*"],
        "gated":     False,
        "note":      "Meta MMS-TTS for Hindi. VITS-based, ~85MB. Open, no token required."
    },
    "tts_mms_mundari": {
        "hf_id":     "facebook/mms-tts-unr",
        "local_dir": "models/tts/vits-mundari-mms",
        "ignore":    ["*.msgpack", "*.h5", "flax_model*"],
        "gated":     False,
        "note":      "Meta MMS-TTS for Mundari language. VITS-based, ~85MB. Open, no token required."
    }
}

def get_hf_token() -> str:
    """Retrieves Hugging Face token from environment, .env, or CLI login."""
    token = os.environ.get("HF_TOKEN") or os.environ.get("HUGGING_FACE_HUB_TOKEN")
    if token:
        return token.strip()
    return None

def download_model(key: str, token: str = None):
    entry = MODEL_REGISTRY[key]
    local = entry["local_dir"]
    target_path = BASE_DIR / local

    print(f"\n{'-'*65}")
    print(f"  Model    : {key}")
    print(f"  HF repo  : {entry['hf_id']}")
    print(f"  Local dir: {local}")
    print(f"  Gated    : {'YES (Hugging Face token required)' if entry['gated'] else 'NO (Direct Open Download)'}")
    print(f"  Note     : {entry['note']}")
    print(f"{'-'*65}")

    # Skip if non-empty
    if target_path.exists() and any(target_path.iterdir()):
        print(f"  [SKIP] Already exists at '{local}'. Delete folder to re-download.")
        return

    try:
        saved_path = snapshot_download(
            repo_id=entry["hf_id"],
            local_dir=str(target_path),
            ignore_patterns=entry.get("ignore", []),
            token=token,
        )
        print(f"  [✓] Downloaded successfully to: {saved_path}")
    except Exception as e:
        err_msg = str(e)
        if "401" in err_msg or "gated" in err_msg.lower():
            print(f"\n[!] Access Denied (401) for gated model '{entry['hf_id']}':")
            print("    1. Create a free account at: https://huggingface.co/join")
            print(f"    2. Accept terms on model page: https://huggingface.co/{entry['hf_id']}")
            print("    3. Get free Access Token at: https://huggingface.co/settings/tokens")
            print("    4. Run: huggingface-cli login  (or pass --token hf_xxx)")
        else:
            print(f"  [✗] Download failed: {e}")

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Download Janbhasha AI Model Weights")
    parser.add_argument(
        "--models", nargs="+",
        choices=list(MODEL_REGISTRY.keys()) + ["all", "open_only", "ai4bharat"],
        default=["open_only"],
        help="Models to download. 'open_only' downloads models that don't need tokens."
    )
    parser.add_argument("--token", default=None, help="Hugging Face User Access Token (hf_...)")
    args = parser.parse_args()

    active_token = args.token or get_hf_token()

    if "all" in args.models:
        keys = list(MODEL_REGISTRY.keys())
    elif "open_only" in args.models:
        keys = [k for k, v in MODEL_REGISTRY.items() if not v["gated"]]
    elif "ai4bharat" in args.models:
        keys = [k for k in MODEL_REGISTRY.keys() if "indictrans2" in k]
    else:
        keys = args.models

    print("\n============================================================")
    print("  Janbhasha Offline Model Downloader")
    print(f"  Selected models: {keys}")
    if active_token:
        print("  Hugging Face Token: Found (Authenticated ✓)")
    else:
        print("  Hugging Face Token: None (Only open models will succeed)")
    print("============================================================\n")

    for k in keys:
        download_model(k, token=active_token)

    print("\n============================================================")
    print("  Done. Model weights are stored in local models/ directory.")
    print("============================================================\n")

if __name__ == "__main__":
    main()

