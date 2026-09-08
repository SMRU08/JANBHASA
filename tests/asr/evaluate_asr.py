"""
Phase 9 — ASR Evaluation Script
================================
Evaluates Whisper ASR on a controlled Hindi speech dataset.

Metrics computed:
  - WER  (Word Error Rate)   — primary ASR metric
  - CER  (Character Error Rate)
  - Average latency per utterance
  - Failure rate (no output / exception)

Usage:
  python tests/asr/evaluate_asr.py \
    --audio_dir tests/asr/audio_samples/ \
    --references tests/asr/references.json \
    --model_path models/asr/whisper-small-indic \
    --output tests/asr/results.json

Audio requirements:
  - 16kHz, mono, WAV
  - Duration: 1–30 seconds
  - Language: Hindi (primary), may include Santali phrases

Output JSON structure:
  {
    "summary": {
      "total": int,
      "wer": float,        (0.0 = perfect)
      "cer": float,
      "avg_latency_ms": float,
      "failure_rate": float,
      "tested_at": ISO8601
    },
    "results": [
      {
        "id": str,
        "audio_file": str,
        "reference": str,
        "hypothesis": str,
        "wer": float,
        "cer": float,
        "latency_ms": int,
        "pass": bool,
        "error": str | null
      }
    ]
  }
"""

import json
import os
import sys
import time
import argparse
from datetime import datetime
from typing import List, Dict, Any, Optional


# ---- WER / CER helpers ----------------------------------------------

def _tokenize(text: str) -> List[str]:
    """Simple whitespace tokenization for WER."""
    return text.strip().lower().split()


def _edit_distance(a: List, b: List) -> int:
    """Levenshtein edit distance between two sequences."""
    m, n = len(a), len(b)
    dp = list(range(n + 1))
    for i in range(1, m + 1):
        prev, dp[0] = dp[0], i
        for j in range(1, n + 1):
            temp = dp[j]
            if a[i - 1] == b[j - 1]:
                dp[j] = prev
            else:
                dp[j] = 1 + min(prev, dp[j], dp[j - 1])
            prev = temp
    return dp[n]


def compute_wer(reference: str, hypothesis: str) -> float:
    ref_tokens = _tokenize(reference)
    hyp_tokens = _tokenize(hypothesis)
    if len(ref_tokens) == 0:
        return 0.0 if len(hyp_tokens) == 0 else 1.0
    return _edit_distance(ref_tokens, hyp_tokens) / len(ref_tokens)


def compute_cer(reference: str, hypothesis: str) -> float:
    ref_chars = list(reference.strip().lower())
    hyp_chars = list(hypothesis.strip().lower())
    if len(ref_chars) == 0:
        return 0.0 if len(hyp_chars) == 0 else 1.0
    return _edit_distance(ref_chars, hyp_chars) / len(ref_chars)


# ---- ASR loader -----------------------------------------------------

def load_asr_engine(model_path: str):
    """
    Load the Whisper ASR engine via faster-whisper (CTranslate2).
    Returns None and prints a warning if faster-whisper is not installed.
    """
    try:
        from faster_whisper import WhisperModel
        print(f"[ASR] Loading model from: {model_path}")
        model = WhisperModel(
            model_path,
            device="cpu",
            compute_type="int8",
            local_files_only=True,
        )
        print("[ASR] Model loaded OK")
        return model
    except ImportError:
        print("[ASR] ERROR: faster-whisper not installed. "
              "Install with: pip install faster-whisper")
        return None
    except Exception as e:
        print(f"[ASR] ERROR loading model: {e}")
        return None


def transcribe_file(model, audio_path: str,
                    language: str = "hi") -> tuple[Optional[str], int, Optional[str]]:
    """
    Transcribe a single audio file.
    Returns: (transcript, latency_ms, error_message)
    """
    if model is None:
        return None, 0, "MODEL_NOT_LOADED"

    t0 = time.perf_counter()
    try:
        segments, info = model.transcribe(
            audio_path,
            language=language,
            beam_size=5,
            vad_filter=True,
        )
        transcript = " ".join(seg.text.strip() for seg in segments)
        latency_ms = int((time.perf_counter() - t0) * 1000)
        return transcript.strip(), latency_ms, None
    except Exception as e:
        latency_ms = int((time.perf_counter() - t0) * 1000)
        return None, latency_ms, str(e)


# ---- Main evaluation loop -------------------------------------------

def evaluate(audio_dir: str, references_path: str,
             model_path: str, output_path: str) -> None:
    print(f"\n{'='*60}")
    print("Janbhasha — Phase 9 ASR Evaluation")
    print(f"{'='*60}")
    print(f"  Model:      {model_path}")
    print(f"  Audio dir:  {audio_dir}")
    print(f"  References: {references_path}")
    print(f"  Output:     {output_path}")
    print()

    # Load references
    if not os.path.exists(references_path):
        print(f"[ERROR] References file not found: {references_path}")
        print("Create tests/asr/references.json first. See sample below:")
        sample = [
            {"id": "hi_001", "file": "hi_001.wav", "reference": "नमस्ते बच्चों"},
            {"id": "hi_002", "file": "hi_002.wav", "reference": "आज हम गिनती सीखेंगे"},
        ]
        print(json.dumps(sample, ensure_ascii=False, indent=2))
        sys.exit(1)

    with open(references_path, encoding="utf-8") as f:
        references: List[Dict] = json.load(f)

    print(f"[ASR] Loaded {len(references)} reference utterances")

    # Load model
    model = load_asr_engine(model_path)

    results = []
    total_wer = 0.0
    total_cer = 0.0
    total_latency = 0
    failures = 0

    for ref in references:
        uid       = ref.get("id", "unknown")
        audio_file = os.path.join(audio_dir, ref["file"])
        reference  = ref["reference"]
        language   = ref.get("language", "hi")

        if not os.path.exists(audio_file):
            results.append({
                "id": uid, "audio_file": audio_file,
                "reference": reference, "hypothesis": "",
                "wer": 1.0, "cer": 1.0, "latency_ms": 0,
                "pass": False, "error": "FILE_NOT_FOUND"
            })
            failures += 1
            print(f"  [{uid}] SKIP — file not found")
            continue

        hypothesis, latency_ms, error = transcribe_file(
            model, audio_file, language)

        if error or hypothesis is None:
            wer, cer = 1.0, 1.0
            failures += 1
            passed = False
            hypothesis = ""
        else:
            wer = compute_wer(reference, hypothesis)
            cer = compute_cer(reference, hypothesis)
            passed = wer <= 0.30  # PASS threshold: ≤ 30% WER

        total_wer     += wer
        total_cer     += cer
        total_latency += latency_ms

        status = "PASS" if passed else "FAIL"
        print(f"  [{uid}] {status}  WER={wer:.2%}  CER={cer:.2%}  "
              f"latency={latency_ms}ms")
        if hypothesis:
            print(f"         REF: {reference}")
            print(f"         HYP: {hypothesis}")

        results.append({
            "id": uid, "audio_file": audio_file,
            "reference": reference, "hypothesis": hypothesis,
            "wer": round(wer, 4), "cer": round(cer, 4),
            "latency_ms": latency_ms, "pass": passed,
            "error": error
        })

    n = len(references)
    summary = {
        "total": n,
        "passed": sum(1 for r in results if r["pass"]),
        "failed": sum(1 for r in results if not r["pass"]),
        "wer":             round(total_wer / n, 4) if n > 0 else None,
        "cer":             round(total_cer / n, 4) if n > 0 else None,
        "avg_latency_ms":  round(total_latency / n, 1) if n > 0 else None,
        "failure_rate":    round(failures / n, 4) if n > 0 else None,
        "wer_target":      0.30,
        "wer_pass":        (total_wer / n <= 0.30) if n > 0 else False,
        "tested_at":       datetime.utcnow().isoformat() + "Z",
    }

    output = {"summary": summary, "results": results}

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*60}")
    print(f"SUMMARY — {n} utterances evaluated")
    print(f"  WER:          {summary['wer']:.2%}" if summary['wer'] is not None else "  WER: N/A")
    print(f"  CER:          {summary['cer']:.2%}" if summary['cer'] is not None else "  CER: N/A")
    print(f"  Avg latency:  {summary['avg_latency_ms']} ms")
    print(f"  Failure rate: {summary['failure_rate']:.2%}" if summary['failure_rate'] is not None else "")
    print(f"  PASSED:       {summary['passed']}/{n}")
    print(f"  WER target:   ≤ 30%  → {'PASS' if summary['wer_pass'] else 'FAIL'}")
    print(f"  Results:      {output_path}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Janbhasha ASR Evaluation — Phase 9")
    parser.add_argument("--audio_dir",   required=True, help="Directory with WAV files")
    parser.add_argument("--references",  required=True, help="Path to references.json")
    parser.add_argument("--model_path",  required=True, help="Path to Whisper model dir")
    parser.add_argument("--output",      default="tests/asr/results.json",
                        help="Output JSON path")
    args = parser.parse_args()
    evaluate(args.audio_dir, args.references, args.model_path, args.output)
