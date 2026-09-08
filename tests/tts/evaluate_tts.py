"""
Phase 9 — TTS Evaluation Script
=================================
Evaluates VITS TTS synthesis quality, latency, and reliability.

Metrics measured:
  - Synthesis latency (ms)
  - Output audio duration (ms)
  - Output file size (bytes)
  - Failure rate
  - Peak RSS memory during synthesis

Subjective quality (requires human listener):
  - Pronunciation accuracy  → NOT_TESTED until human review
  - Intelligibility          → NOT_TESTED
  - Naturalness              → NOT_TESTED

Usage:
  python tests/tts/evaluate_tts.py \
    --dataset tests/tts/tts_dataset.json \
    --model_path models/tts/vits-santali-mms \
    --language sat \
    --output_dir tests/tts/audio_output/ \
    --output tests/tts/results_sat.json
"""

import json
import os
import sys
import time
import argparse
import struct
import subprocess
from datetime import datetime
from typing import List, Dict, Optional


# ---- WAV duration reader --------------------------------------------

def wav_duration_ms(wav_path: str) -> Optional[int]:
    """Read duration in milliseconds from WAV RIFF header."""
    try:
        with open(wav_path, "rb") as f:
            f.seek(22)  # NumChannels offset
            num_channels = struct.unpack("<H", f.read(2))[0]
            sample_rate  = struct.unpack("<I", f.read(4))[0]
            f.seek(40)   # Subchunk2Size (data size)
            data_size    = struct.unpack("<I", f.read(4))[0]
        if num_channels == 0 or sample_rate == 0:
            return None
        bytes_per_sample = 2  # assume 16-bit
        num_samples = data_size // (num_channels * bytes_per_sample)
        return int(num_samples * 1000 / sample_rate)
    except Exception:
        return None


# ---- RSS memory reader ---------------------------------------------

def process_rss_kb() -> int:
    """Read current process RSS from /proc/self/status (Linux) or approximation."""
    try:
        with open("/proc/self/status") as f:
            for line in f:
                if line.startswith("VmRSS:"):
                    return int(line.split()[1])
    except Exception:
        pass
    # Windows fallback
    try:
        import psutil
        return psutil.Process().memory_info().rss // 1024
    except Exception:
        return 0


# ---- TTS loader ----------------------------------------------------

def load_tts_engine(model_path: str, language: str):
    """
    Load VITS TTS model via HuggingFace Transformers (VitsModel + VitsTokenizer).
    Returns None if model not found or import fails.
    """
    if not os.path.exists(model_path):
        print(f"[TTS] ERROR: Model not found: {model_path}")
        return None

    try:
        from transformers import VitsModel, VitsTokenizer
        import torch
        print(f"[TTS] Loading VITS from: {model_path}")
        tokenizer = VitsTokenizer.from_pretrained(
            model_path, local_files_only=True)
        model = VitsModel.from_pretrained(
            model_path, local_files_only=True)
        model.eval()
        print(f"[TTS] Model loaded OK (lang={language})")
        return {"tokenizer": tokenizer, "model": model, "language": language}
    except ImportError:
        print("[TTS] ERROR: transformers not installed. pip install transformers")
        return None
    except Exception as e:
        print(f"[TTS] Load error: {e}")
        return None


def synthesize(engine, text: str, output_path: str) -> tuple[bool, int, Optional[str]]:
    """
    Synthesize text to WAV. Returns (success, latency_ms, error).
    NOTE: VITS must run in FP32. Do NOT use float16/int8 for TTS.
    """
    if engine is None:
        return False, 0, "MODEL_NOT_LOADED"

    t0 = time.perf_counter()
    try:
        import torch
        import scipy.io.wavfile
        import numpy as np

        tokenizer = engine["tokenizer"]
        model     = engine["model"]

        inputs = tokenizer(text, return_tensors="pt")
        with torch.no_grad():
            output = model(**inputs)

        # VITS output shape: (1, sequence_length)
        waveform = output.waveform[0].cpu().numpy()
        sample_rate = model.config.sampling_rate

        # Save as WAV (float32 → int16 conversion for compatibility)
        waveform_int16 = (waveform * 32767).clip(-32768, 32767).astype("int16")
        scipy.io.wavfile.write(output_path, sample_rate, waveform_int16)

        latency_ms = int((time.perf_counter() - t0) * 1000)
        return True, latency_ms, None
    except Exception as e:
        latency_ms = int((time.perf_counter() - t0) * 1000)
        return False, latency_ms, str(e)


# ---- Main evaluation -----------------------------------------------

def evaluate(dataset_path: str, model_path: str, language: str,
             output_dir: str, output_path: str) -> None:

    print(f"\n{'='*60}")
    print(f"Janbhasha — Phase 9 TTS Evaluation ({language})")
    print(f"{'='*60}")

    with open(dataset_path, encoding="utf-8") as f:
        dataset: List[Dict] = json.load(f)

    test_cases = [d for d in dataset if d.get("language", language) == language]
    print(f"[TTS] {len(test_cases)} test cases for language={language}")

    os.makedirs(output_dir, exist_ok=True)
    engine = load_tts_engine(model_path, language)

    results = []
    total_latency = 0
    failures = 0
    rss_before = process_rss_kb()
    peak_rss_delta = 0

    for tc in test_cases:
        uid      = tc.get("id", "unknown")
        text     = tc["text"]
        category = tc.get("category", "general")
        out_path = os.path.join(output_dir, f"{uid}.wav")

        rss_before_item = process_rss_kb()
        success, latency_ms, error = synthesize(engine, text, out_path)
        rss_after_item = process_rss_kb()
        rss_delta = rss_after_item - rss_before_item
        peak_rss_delta = max(peak_rss_delta, rss_delta)

        duration_ms = wav_duration_ms(out_path) if success else None
        file_bytes  = os.path.getsize(out_path) if (success and os.path.exists(out_path)) else 0

        if not success:
            failures += 1

        total_latency += latency_ms

        status = "PASS" if success else "FAIL"
        print(f"  [{uid}] {status}  latency={latency_ms}ms  "
              f"duration={duration_ms}ms  size={file_bytes}B  cat={category}")
        if error:
            print(f"         ERROR: {error}")

        results.append({
            "id": uid,
            "category": category,
            "text": text,
            "output_file": out_path if success else None,
            "success": success,
            "latency_ms": latency_ms,
            "duration_ms": duration_ms,
            "file_bytes": file_bytes,
            "rss_delta_kb": rss_delta,
            "error": error,
            "human_pronunciation": "NOT_TESTED",
            "human_intelligibility": "NOT_TESTED",
            "human_naturalness": "NOT_TESTED",
        })

    n = len(test_cases)
    summary = {
        "language": language,
        "total": n,
        "passed": n - failures,
        "failed": failures,
        "avg_latency_ms": round(total_latency / n, 1) if n > 0 else None,
        "failure_rate": round(failures / n, 4) if n > 0 else None,
        "peak_rss_delta_kb": peak_rss_delta,
        "human_eval_required": True,
        "note": ("Pronunciation/intelligibility/naturalness require "
                 "human evaluation. Mark 'NOT_TESTED' until completed."),
        "tested_at": datetime.utcnow().isoformat() + "Z",
    }

    output = {"summary": summary, "results": results}
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*60}")
    print(f"SUMMARY — {n} TTS tests ({language})")
    print(f"  Passed:        {n - failures}/{n}")
    print(f"  Avg latency:   {summary['avg_latency_ms']} ms")
    print(f"  Peak RSS Δ:    {peak_rss_delta} KB")
    print(f"  Human eval:    REQUIRED — pronunciation/intelligibility pending")
    print(f"  Output audio:  {output_dir}")
    print(f"  Results:       {output_path}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Janbhasha TTS Evaluation — Phase 9")
    parser.add_argument("--dataset",    required=True)
    parser.add_argument("--model_path", required=True)
    parser.add_argument("--language",   default="sat")
    parser.add_argument("--output_dir", default="tests/tts/audio_output/")
    parser.add_argument("--output",     default="tests/tts/results.json")
    args = parser.parse_args()
    evaluate(args.dataset, args.model_path, args.language,
             args.output_dir, args.output)
