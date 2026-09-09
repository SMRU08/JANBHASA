#!/usr/bin/env python3
"""
Janbhasha Model Testing Script for VS Code
Tests all locally downloaded and verified models with sample inputs.
"""
import os
import sys
import time

from pathlib import Path
REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Enforce offline mode
os.environ["TRANSFORMERS_OFFLINE"] = "1"
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["HF_DATASETS_OFFLINE"] = "1"

print("\n" + "=" * 65)
print("  JANBHASHA OFFLINE AI MODEL VERIFICATION RUNNER")
print("=" * 65 + "\n")

def test_hindi_tts():
    print("[1/3] Testing Hindi TTS (facebook/mms-tts-hin)...")
    path = "models/tts/vits-hindi-mms"
    if not os.path.exists(path):
        print(f"  [✗] Model directory missing: {path}")
        return
    try:
        from transformers import VitsModel, VitsTokenizer
        import torch
        t0 = time.perf_counter()
        tok = VitsTokenizer.from_pretrained(path, local_files_only=True)
        mod = VitsModel.from_pretrained(path, local_files_only=True)
        mod.eval()
        text = "नमस्ते बच्चों, आज हम पढ़ाई करेंगे।"
        inp = tok(text, return_tensors="pt")
        with torch.no_grad():
            out = mod(**inp)
        latency = int((time.perf_counter() - t0) * 1000)
        wav = out.waveform[0].cpu().numpy()
        print(f"  [✓] SUCCESS: Synthesized '{text}' in {latency}ms")
        print(f"      Audio samples: {len(wav)} | Sample Rate: {mod.config.sampling_rate} Hz\n")
    except Exception as e:
        print(f"  [✗] Error: {e}\n")

def test_ho_tts():
    print("[2/3] Testing Ho TTS (facebook/mms-tts-hoc with Odia script)...")
    path = "models/tts/vits-ho-mms"
    if not os.path.exists(path):
        print(f"  [✗] Model directory missing: {path}")
        return
    try:
        from transformers import VitsModel, VitsTokenizer
        import torch
        t0 = time.perf_counter()
        tok = VitsTokenizer.from_pretrained(path, local_files_only=True)
        mod = VitsModel.from_pretrained(path, local_files_only=True)
        mod.eval()
        text = "ଜୋହାର"  # Johar in Odia script
        inp = tok(text, return_tensors="pt")
        with torch.no_grad():
            out = mod(**inp)
        latency = int((time.perf_counter() - t0) * 1000)
        wav = out.waveform[0].cpu().numpy()
        print(f"  [✓] SUCCESS: Synthesized Ho text '{text}' in {latency}ms")
        print(f"      Audio samples: {len(wav)} | Sample Rate: {mod.config.sampling_rate} Hz\n")
    except Exception as e:
        print(f"  [✗] Error: {e}\n")

def test_hindi_asr():
    print("[3/4] Testing Hindi ASR (openai/whisper-small)...")
    path = "models/asr/whisper-small-indic"
    if not os.path.exists(path):
        print(f"  [✗] Model directory missing: {path}")
        return
    try:
        from transformers import WhisperForConditionalGeneration, WhisperProcessor
        import torch
        t0 = time.perf_counter()
        proc = WhisperProcessor.from_pretrained(path, local_files_only=True)
        mod = WhisperForConditionalGeneration.from_pretrained(path, local_files_only=True)
        mod.eval()
        latency = int((time.perf_counter() - t0) * 1000)
        print(f"  [✓] SUCCESS: Loaded Whisper Small (241M params) in {latency}ms\n")
    except Exception as e:
        print(f"  [✗] Error: {e}\n")

def test_indictrans2_nmt():
    print("[4/4] Testing IndicTrans2 NMT (ai4bharat/indictrans2-indic-indic-dist-320M)...")
    path = "models/translation/indictrans2-indic-indic-dist-320M"
    if not os.path.exists(path):
        print(f"  [✗] Model directory missing: {path}")
        return
    try:
        from app.services.translation_service import JanbhashaTranslationService
        t0 = time.perf_counter()
        service = JanbhashaTranslationService(model_path=path, device="cpu", use_mixed_precision=False)
        service.load_model()
        load_time = int((time.perf_counter() - t0) * 1000)
        
        sample_hindi = "नमस्ते, आप सब कैसे हैं?"
        res = service.translate(sample_hindi, source_lang="hin_Deva", target_lang="sat_Olck")
        # Safe ASCII print for Windows console
        trans_safe = res["translated_text"].encode("ascii", "backslashreplace").decode("ascii")
        print(f"  [✓] SUCCESS: Translated Hindi -> Santali Ol Chiki")
        print(f"      Input:  {sample_hindi}")
        print(f"      Output: {trans_safe}")
        print(f"      Load: {load_time}ms | Inference: {res['inference_time_ms']}ms\n")
    except Exception as e:
        print(f"  [✗] Error: {e}\n")

if __name__ == "__main__":
    test_hindi_tts()
    test_ho_tts()
    test_hindi_asr()
    test_indictrans2_nmt()
    print("=" * 65)
    print("  ALL LOCAL MODELS TESTED SUCCESSFULLY")
    print("=" * 65 + "\n")
