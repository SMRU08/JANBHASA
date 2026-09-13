"""
Phase 9 - Stress Test: Repeated pipeline sessions.
Runs ASR -> translate -> TTS N times and checks for memory growth,
latency degradation, and failures.

Usage:
  cd path/to/JANBHASHA
  .\\venv\\Scripts\\Activate.ps1
  python tests/stress/stress_test.py --runs 10 --model_base models/ --output tests/stress/results.json
"""
import sys, os, gc, json, time, argparse
from datetime import datetime

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")


def rss_kb() -> int:
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


def run_single_pipeline(asr_path: str, nmt_path: str, tts_path: str,
                         cache_dir: str, run_idx: int) -> dict:
    """Run one full ASR->NMT->TTS cycle. Returns timing and memory info."""
    result = {"run": run_idx, "asr_ms": 0, "nmt_ms": 0, "tts_ms": 0,
              "total_ms": 0, "rss_before_kb": 0, "rss_after_kb": 0,
              "rss_delta_kb": 0, "error": None, "pass": False}

    rss_before = rss_kb()
    result["rss_before_kb"] = rss_before
    t_total = time.perf_counter()

    # ---- ASR --------------------------------------------------------
    try:
        from faster_whisper import WhisperModel
        t0 = time.perf_counter()
        asr = WhisperModel(asr_path, device="cpu", compute_type="int8",
                           local_files_only=True)
        # 1-second silence WAV
        test_wav = os.path.join(cache_dir, "stress_silence.wav")
        if not os.path.exists(test_wav):
            import wave
            with wave.open(test_wav, "w") as wf:
                wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(16000)
                wf.writeframes(b"\x00\x00" * 16000)
        list(asr.transcribe(test_wav, language="hi")[0])
        result["asr_ms"] = int((time.perf_counter() - t0) * 1000)
        transcript = "namaste"
        del asr; gc.collect()
    except Exception as e:
        result["error"] = f"ASR: {e}"
        return result

    # ---- NMT --------------------------------------------------------
    try:
        from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
        import torch
        t0 = time.perf_counter()
        tok = AutoTokenizer.from_pretrained(nmt_path, local_files_only=True,
                                             trust_remote_code=True)
        mdl = AutoModelForSeq2SeqLM.from_pretrained(nmt_path,
                                                     local_files_only=True,
                                                     trust_remote_code=True)
        mdl.eval()
        inputs = tok(f"[hi_Deva] {transcript}", return_tensors="pt")
        with torch.no_grad():
            out = mdl.generate(**inputs, max_length=64)
        translated = tok.decode(out[0], skip_special_tokens=True)
        result["nmt_ms"] = int((time.perf_counter() - t0) * 1000)
        del tok, mdl, out; gc.collect()
    except Exception as e:
        result["error"] = f"NMT: {e}"
        return result

    # ---- TTS --------------------------------------------------------
    try:
        from transformers import VitsModel, VitsTokenizer
        import torch, scipy.io.wavfile, numpy as np
        t0 = time.perf_counter()
        ttok = VitsTokenizer.from_pretrained(tts_path, local_files_only=True)
        tmdl = VitsModel.from_pretrained(tts_path, local_files_only=True)
        tmdl.eval()
        inp = ttok("namaste", return_tensors="pt")
        with torch.no_grad():
            wav = tmdl(**inp).waveform[0].cpu().numpy()
        out_wav = os.path.join(cache_dir, f"stress_out_{run_idx}.wav")
        scipy.io.wavfile.write(out_wav, tmdl.config.sampling_rate,
                               (wav * 32767).clip(-32768, 32767).astype("int16"))
        result["tts_ms"] = int((time.perf_counter() - t0) * 1000)
        del ttok, tmdl, wav; gc.collect()
        if os.path.exists(out_wav):
            os.remove(out_wav)  # cleanup
    except Exception as e:
        result["error"] = f"TTS: {e}"
        return result

    result["total_ms"] = int((time.perf_counter() - t_total) * 1000)
    result["rss_after_kb"] = rss_kb()
    result["rss_delta_kb"] = result["rss_after_kb"] - rss_before
    result["pass"] = True
    return result


def run_stress(runs: int, model_base: str, cache_dir: str, output_path: str):
    print(f"\n{'='*60}")
    print(f"Janbhasha - Phase 9 Stress Test ({runs} runs)")
    print(f"{'='*60}")

    asr_path = os.path.join(model_base, "asr", "whisper-small-indic")
    nmt_path = os.path.join(model_base, "translation", "indictrans2-en-santali")
    tts_path = os.path.join(model_base, "tts", "vits-hindi-mms")

    # Check model availability
    for label, path in [("ASR", asr_path), ("NMT", nmt_path), ("TTS", tts_path)]:
        exists = os.path.isdir(path)
        print(f"  {label}: {'OK' if exists else 'MISSING'} ({path})")

    os.makedirs(cache_dir, exist_ok=True)
    results = []
    baseline_rss = rss_kb()
    print(f"\n  Baseline RSS: {baseline_rss} KB ({baseline_rss//1024} MB)")
    print()

    for i in range(1, runs + 1):
        print(f"  Run {i}/{runs}...", end=" ", flush=True)
        r = run_single_pipeline(asr_path, nmt_path, tts_path, cache_dir, i)
        results.append(r)
        status = "PASS" if r["pass"] else f"FAIL ({r['error']})"
        print(f"{status}  total={r['total_ms']}ms  "
              f"rss_delta={r['rss_delta_kb']}KB")

    # Analyse
    passed       = [r for r in results if r["pass"]]
    rss_start    = results[0]["rss_before_kb"] if results else 0
    rss_end      = results[-1]["rss_after_kb"] if results else 0
    rss_growth   = rss_end - rss_start
    latencies    = [r["total_ms"] for r in passed]
    avg_lat      = round(sum(latencies) / len(latencies), 1) if latencies else None
    max_lat      = max(latencies) if latencies else None
    # Latency degradation: compare first 20% vs last 20%
    n_slice = max(1, len(passed) // 5)
    first_avg = sum(r["total_ms"] for r in passed[:n_slice]) / n_slice if passed else 0
    last_avg  = sum(r["total_ms"] for r in passed[-n_slice:]) / n_slice if passed else 0
    degraded  = (last_avg - first_avg) > 500  # >500ms degradation = FAIL

    summary = {
        "runs": runs, "passed": len(passed),
        "failed": runs - len(passed),
        "avg_latency_ms": avg_lat, "max_latency_ms": max_lat,
        "latency_degraded": degraded,
        "first_avg_ms": round(first_avg, 1),
        "last_avg_ms": round(last_avg, 1),
        "rss_growth_kb": rss_growth,
        "rss_growth_mb": round(rss_growth / 1024, 1),
        "memory_stable": rss_growth < 50 * 1024,  # <50MB growth = stable
        "stress_pass": len(passed) == runs and not degraded and rss_growth < 50 * 1024,
        "tested_at": datetime.utcnow().isoformat() + "Z",
    }

    output = {"summary": summary, "runs": results}
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*60}")
    print(f"STRESS TEST RESULTS ({runs} runs)")
    print(f"  Passed:         {len(passed)}/{runs}")
    print(f"  Avg latency:    {avg_lat} ms")
    print(f"  Max latency:    {max_lat} ms")
    print(f"  Latency stable: {'YES' if not degraded else 'NO - degraded'}")
    print(f"  RSS growth:     {rss_growth} KB ({rss_growth//1024} MB)")
    print(f"  Memory stable:  {'YES' if summary['memory_stable'] else 'NO - possible leak'}")
    print(f"  STRESS PASS:    {'YES' if summary['stress_pass'] else 'NO'}")
    print(f"  Results:        {output_path}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--runs",       type=int, default=10)
    p.add_argument("--model_base", default="models/")
    p.add_argument("--cache_dir",  default="tests/stress/tmp/")
    p.add_argument("--output",     default="tests/stress/results.json")
    args = p.parse_args()
    run_stress(args.runs, args.model_base, args.cache_dir, args.output)
