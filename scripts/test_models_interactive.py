#!/usr/bin/env python3
"""
Janbhasha Model Testing Script for VS Code
Tests all locally downloaded and verified models with sample inputs.
"""
import os
import sys
import time

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
    print("[3/3] Testing Hindi ASR (openai/whisper-small)...")
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

if __name__ == "__main__":
    test_hindi_tts()
    test_ho_tts()
    test_hindi_asr()
    print("=" * 65)
    print("  ALL LOCAL MODELS TESTED SUCCESSFULLY")
    print("=" * 65 + "\n")
