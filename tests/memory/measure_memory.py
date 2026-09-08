"""
Phase 9 — Memory Testing Script
=================================
Measures actual RAM usage (RSS/PSS) during each pipeline stage.
Verifies that memory is actually released after model unload.

IMPORTANT: RSS drop after Python del/gc.collect() is not immediate
on all Android versions. This script measures ΔSS before/after each
stage boundary to detect leaks.

Usage (on the Android device via ADB shell or on server for backend):
  python tests/memory/measure_memory.py \
    --model_base models/ \
    --cache_dir /tmp/janbhasha_test/ \
    --output tests/memory/results.json

For Android device measurement:
  Use `adb shell dumpsys meminfo com.janbhasha` and
  `adb shell cat /proc/<pid>/status` to get VmRSS/VmPSS.
  See tests/memory/measure_android_memory.sh for the adb script.
"""

import json
import os
import gc
import sys
import time
import argparse
from datetime import datetime


def rss_kb() -> int:
    """Read RSS from /proc/self/status (Linux/Android)."""
    try:
        with open("/proc/self/status") as f:
            for line in f:
                if line.startswith("VmRSS:"):
                    return int(line.split()[1])
    except Exception:
        pass
    try:
        import psutil
        return psutil.Process().memory_info().rss // 1024
    except Exception:
        return -1


def stage(name: str, measurements: list, fn) -> dict:
    """
    Run fn(), measure RSS before and after.
    Returns measurement dict.
    """
    gc.collect()
    time.sleep(0.5)  # let OS reclaim
    before = rss_kb()
    t0 = time.perf_counter()
    result = None
    error = None
    try:
        result = fn()
    except Exception as e:
        error = str(e)
    latency_ms = int((time.perf_counter() - t0) * 1000)
    gc.collect()
    time.sleep(0.5)
    after = rss_kb()

    m = {
        "stage": name,
        "rss_before_kb": before,
        "rss_after_kb": after,
        "rss_delta_kb": after - before,
        "latency_ms": latency_ms,
        "error": error,
    }
    measurements.append(m)
    sign = "▲" if m["rss_delta_kb"] > 0 else "▼"
    print(f"  [{name}]  RSS: {before}KB → {after}KB  "
          f"(Δ{sign}{abs(m['rss_delta_kb'])}KB)  latency={latency_ms}ms"
          + (f"  ERROR: {error}" if error else ""))
    return m


def run_memory_test(model_base: str, cache_dir: str, output_path: str) -> None:
    print(f"\n{'='*60}")
    print("Janbhasha — Phase 9 Memory Measurement")
    print(f"{'='*60}")
    print(f"  Model base: {model_base}")
    print(f"  Cache dir:  {cache_dir}")
    print()

    os.makedirs(cache_dir, exist_ok=True)
    measurements = []
    baseline = rss_kb()
    print(f"  Baseline RSS: {baseline} KB  ({baseline//1024} MB)")
    print()

    # ----------------------------------------------------------------
    # Stage 1: ASR load
    # ----------------------------------------------------------------
    asr_model = None
    asr_path = os.path.join(model_base, "asr", "whisper-small-indic")

    def load_asr():
        nonlocal asr_model
        from faster_whisper import WhisperModel
        asr_model = WhisperModel(asr_path, device="cpu",
                                  compute_type="int8", local_files_only=True)
    stage("ASR_LOAD", measurements, load_asr)

    # ----------------------------------------------------------------
    # Stage 2: ASR transcribe
    # ----------------------------------------------------------------
    test_audio = os.path.join(cache_dir, "test_silence.wav")
    if not os.path.exists(test_audio):
        # Create 1-second silent WAV for testing
        import struct, wave
        with wave.open(test_audio, "w") as wf:
            wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(16000)
            wf.writeframes(b"\x00\x00" * 16000)

    def run_asr():
        if asr_model is None:
            raise RuntimeError("ASR not loaded")
        list(asr_model.transcribe(test_audio, language="hi")[0])
    stage("ASR_TRANSCRIBE", measurements, run_asr)

    # ----------------------------------------------------------------
    # Stage 3: ASR unload
    # ----------------------------------------------------------------
    def unload_asr():
        nonlocal asr_model
        del asr_model
        asr_model = None
        gc.collect()
    stage("ASR_UNLOAD", measurements, unload_asr)

    # ----------------------------------------------------------------
    # Stage 4: NMT load
    # ----------------------------------------------------------------
    nmt_model = None
    nmt_tokenizer = None
    nmt_path = os.path.join(model_base, "translation",
                             "indictrans2-en-santali")

    def load_nmt():
        nonlocal nmt_model, nmt_tokenizer
        if not os.path.exists(nmt_path):
            raise FileNotFoundError(f"NMT model not found: {nmt_path}")
        from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
        nmt_tokenizer = AutoTokenizer.from_pretrained(
            nmt_path, local_files_only=True, trust_remote_code=True)
        nmt_model = AutoModelForSeq2SeqLM.from_pretrained(
            nmt_path, local_files_only=True, trust_remote_code=True)
        nmt_model.eval()
    stage("NMT_LOAD", measurements, load_nmt)

    # ----------------------------------------------------------------
    # Stage 5: NMT translate
    # ----------------------------------------------------------------
    def run_nmt():
        import torch
        inputs = nmt_tokenizer("[hi_Deva] नमस्ते", return_tensors="pt")
        with torch.no_grad():
            nmt_model.generate(**inputs, max_length=64)
    stage("NMT_TRANSLATE", measurements, run_nmt)

    # ----------------------------------------------------------------
    # Stage 6: NMT unload
    # ----------------------------------------------------------------
    def unload_nmt():
        nonlocal nmt_model, nmt_tokenizer
        del nmt_model, nmt_tokenizer
        nmt_model = nmt_tokenizer = None
        gc.collect()
    stage("NMT_UNLOAD", measurements, unload_nmt)

    # ----------------------------------------------------------------
    # Stage 7: TTS load
    # ----------------------------------------------------------------
    tts_model = None
    tts_tokenizer = None
    tts_path = os.path.join(model_base, "tts", "vits-hindi-mms")

    def load_tts():
        nonlocal tts_model, tts_tokenizer
        if not os.path.exists(tts_path):
            raise FileNotFoundError(f"TTS model not found: {tts_path}")
        from transformers import VitsModel, VitsTokenizer
        tts_tokenizer = VitsTokenizer.from_pretrained(tts_path, local_files_only=True)
        tts_model = VitsModel.from_pretrained(tts_path, local_files_only=True)
        tts_model.eval()
    stage("TTS_LOAD", measurements, load_tts)

    # ----------------------------------------------------------------
    # Stage 8: TTS synthesize
    # ----------------------------------------------------------------
    def run_tts():
        import torch
        inputs = tts_tokenizer("नमस्ते", return_tensors="pt")
        with torch.no_grad():
            tts_model(**inputs)
    stage("TTS_SYNTHESIZE", measurements, run_tts)

    # ----------------------------------------------------------------
    # Stage 9: TTS unload
    # ----------------------------------------------------------------
    def unload_tts():
        nonlocal tts_model, tts_tokenizer
        del tts_model, tts_tokenizer
        tts_model = tts_tokenizer = None
        gc.collect()
    stage("TTS_UNLOAD", measurements, unload_tts)

    # ----------------------------------------------------------------
    # Summary
    # ----------------------------------------------------------------
    final_rss = rss_kb()
    peak_rss  = max(m["rss_after_kb"] for m in measurements)
    leak_kb   = final_rss - baseline

    summary = {
        "baseline_rss_kb": baseline,
        "peak_rss_kb": peak_rss,
        "final_rss_kb": final_rss,
        "apparent_leak_kb": leak_kb,
        "peak_ram_mb": round(peak_rss / 1024, 1),
        "target_peak_mb": 600,
        "within_budget": peak_rss <= 600 * 1024,
        "note": ("RSS drop after del() is not immediate on all kernels. "
                 "A non-zero apparent_leak_kb < 50MB is normal due to "
                 "kernel page-cache retention. Verify with Android MemInfo."),
        "tested_at": datetime.utcnow().isoformat() + "Z",
    }

    output = {"summary": summary, "stages": measurements}
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)

    print(f"\n{'='*60}")
    print(f"MEMORY RESULTS")
    print(f"  Baseline RSS:  {baseline} KB  ({baseline//1024} MB)")
    print(f"  Peak RSS:      {peak_rss} KB  ({peak_rss//1024} MB)")
    print(f"  Final RSS:     {final_rss} KB")
    print(f"  Apparent leak: {leak_kb} KB")
    print(f"  Within budget (<600MB peak): {'YES' if summary['within_budget'] else 'NO'}")
    print(f"  Results: {output_path}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Janbhasha Memory Test — Phase 9")
    parser.add_argument("--model_base", required=True)
    parser.add_argument("--cache_dir",  default="/tmp/janbhasha_test/")
    parser.add_argument("--output",     default="tests/memory/results.json")
    args = parser.parse_args()
    run_memory_test(args.model_base, args.cache_dir, args.output)
