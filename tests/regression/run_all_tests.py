"""
Phase 9 - Regression Test Runner
Runs all evaluation scripts in sequence and aggregates results.

Usage:
  .\\venv\\Scripts\\Activate.ps1
  python tests/regression/run_all_tests.py --model_base models/ --output tests/regression/full_report.json
"""
import sys, os, json, subprocess, time, argparse
from datetime import datetime

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

PYTHON = sys.executable

TESTS = [
    {
        "name": "Network Audit",
        "cmd": [PYTHON, "tests/network_audit/audit_network.py",
                "--project_root", ".", "--output", "tests/network_audit/results.json"],
        "result_file": "tests/network_audit/results.json",
        "pass_key": "network_audit_passed",
    },
    {
        "name": "Offline Environment Check",
        "cmd": [PYTHON, "tests/offline/test_offline.py", "--model_base", "{model_base}"],
        "result_file": "tests/offline/results.json",
        "pass_key": "offline_accepted",
    },
    {
        "name": "Memory Measurement",
        "cmd": [PYTHON, "tests/memory/measure_memory.py",
                "--model_base", "{model_base}",
                "--cache_dir", "tests/memory/tmp/",
                "--output", "tests/memory/results.json"],
        "result_file": "tests/memory/results.json",
        "pass_key": "within_budget",
    },
    {
        "name": "ASR Evaluation",
        "cmd": [PYTHON, "tests/asr/evaluate_asr.py",
                "--audio_dir", "tests/asr/audio_samples/",
                "--references", "tests/asr/references.json",
                "--model_path", "{model_base}/asr/whisper-small-indic",
                "--output", "tests/asr/results.json"],
        "result_file": "tests/asr/results.json",
        "pass_key": "wer_pass",
    },
    {
        "name": "Translation Evaluation (hi->sat)",
        "cmd": [PYTHON, "tests/translation/evaluate_translation.py",
                "--references", "tests/translation/translation_dataset.json",
                "--model_path", "{model_base}/translation/indictrans2-en-santali",
                "--src_lang", "hi", "--tgt_lang", "sat",
                "--output", "tests/translation/results_hi_sat.json"],
        "result_file": "tests/translation/results_hi_sat.json",
        "pass_key": None,  # BLEU only — human eval required
    },
    {
        "name": "TTS Evaluation (sat)",
        "cmd": [PYTHON, "tests/tts/evaluate_tts.py",
                "--dataset", "tests/tts/tts_dataset.json",
                "--model_path", "{model_base}/tts/vits-santali-mms",
                "--language", "sat",
                "--output_dir", "tests/tts/audio_output_sat/",
                "--output", "tests/tts/results_sat.json"],
        "result_file": "tests/tts/results_sat.json",
        "pass_key": None,  # Human eval required
    },
    {
        "name": "FLN Tests",
        "cmd": [PYTHON, "tests/fln/test_fln.py",
                "--model_base", "{model_base}",
                "--output", "tests/fln/results.json"],
        "result_file": "tests/fln/results.json",
        "pass_key": None,
    },
]


def run_test(test: dict, model_base: str) -> dict:
    name = test["name"]
    cmd  = [c.replace("{model_base}", model_base) for c in test["cmd"]]
    print(f"\n  Running: {name}")
    print(f"  CMD: {' '.join(cmd)}")

    t0 = time.perf_counter()
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True,
                              encoding="utf-8", errors="replace", timeout=600)
        duration_s = round(time.perf_counter() - t0, 1)
        exit_code  = proc.returncode
        print(proc.stdout[-2000:] if proc.stdout else "")
        if proc.stderr:
            print("STDERR:", proc.stderr[-500:])
    except subprocess.TimeoutExpired:
        return {"name": name, "status": "TIMEOUT", "duration_s": 600,
                "exit_code": -1, "pass": False, "summary": {}}
    except Exception as e:
        return {"name": name, "status": "ERROR", "duration_s": 0,
                "exit_code": -1, "pass": False, "summary": {}, "error": str(e)}

    # Load result file
    summary = {}
    passed  = None
    rf = test["result_file"]
    if os.path.exists(rf):
        try:
            data    = json.load(open(rf, encoding="utf-8"))
            summary = data.get("summary", {})
            if test["pass_key"]:
                passed = summary.get(test["pass_key"], None)
        except Exception:
            pass

    status = ("PASS" if passed is True else
              "FAIL" if passed is False else
              "NOT_TESTED" if passed is None else "UNKNOWN")

    return {
        "name": name, "status": status, "duration_s": duration_s,
        "exit_code": exit_code, "pass": passed, "summary": summary,
    }


def run_all(model_base: str, output_path: str) -> None:
    print(f"\n{'='*60}")
    print("Janbhasha - Phase 9 Full Regression Suite")
    print(f"  Model base: {model_base}")
    print(f"{'='*60}")

    all_results = []
    for test in TESTS:
        r = run_test(test, model_base)
        all_results.append(r)
        print(f"  -> {r['name']}: {r['status']} ({r['duration_s']}s)")

    passed   = sum(1 for r in all_results if r["status"] == "PASS")
    failed   = sum(1 for r in all_results if r["status"] == "FAIL")
    nt       = sum(1 for r in all_results if r["status"] == "NOT_TESTED")
    total    = len(all_results)

    summary = {
        "total": total, "passed": passed, "failed": failed,
        "not_tested": nt,
        "phase9_ready": failed == 0 and nt == 0,
        "tested_at": datetime.utcnow().isoformat() + "Z",
    }
    output = {"summary": summary, "tests": all_results}
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*60}")
    print(f"REGRESSION SUITE COMPLETE")
    print(f"  PASS:       {passed}/{total}")
    print(f"  FAIL:       {failed}/{total}")
    print(f"  NOT_TESTED: {nt}/{total}")
    print(f"  Phase 9 READY: {'YES' if summary['phase9_ready'] else 'NO'}")
    print(f"  Full report: {output_path}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--model_base", default="models/")
    p.add_argument("--output",     default="tests/regression/full_report.json")
    args = p.parse_args()
    run_all(args.model_base, args.output)
