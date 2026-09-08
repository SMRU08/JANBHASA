"""
Phase 9 - FLN (Foundational Literacy & Numeracy) Test Cases
Tests translation and TTS for NIPUN Bharat educational content.

Usage:
  python tests/fln/test_fln.py --model_base models/ --output tests/fln/results.json
"""
import sys, os, json, time, argparse
from datetime import datetime

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

FLN_TEST_CASES = [
    # ---- Literacy ----
    {"id": "fln_lit_001", "category": "alphabet",
     "hindi": "क अक्षर से कमल बनता है",
     "expected_sat": None, "note": "Alphabet: K for Kamal"},
    {"id": "fln_lit_002", "category": "word_reading",
     "hindi": "यह शब्द पढ़ो",
     "expected_sat": None, "note": "Read this word"},
    {"id": "fln_lit_003", "category": "sentence_reading",
     "hindi": "बच्चे स्कूल जाते हैं",
     "expected_sat": None, "note": "Children go to school"},
    # ---- Numeracy ----
    {"id": "fln_num_001", "category": "counting",
     "hindi": "एक से दस तक गिनो",
     "expected_sat": None, "note": "Count 1-10"},
    {"id": "fln_num_002", "category": "addition",
     "hindi": "दो जोड़ तीन बराबर पाँच",
     "expected_sat": None, "note": "2+3=5"},
    {"id": "fln_num_003", "category": "subtraction",
     "hindi": "पाँच में से दो घटाओ",
     "expected_sat": None, "note": "5-2"},
    {"id": "fln_num_004", "category": "shapes",
     "hindi": "यह त्रिभुज है",
     "expected_sat": None, "note": "This is a triangle"},
    {"id": "fln_num_005", "category": "colors",
     "hindi": "आसमान का रंग नीला है",
     "expected_sat": None, "note": "Sky is blue"},
    # ---- Classroom commands ----
    {"id": "fln_cls_001", "category": "instruction",
     "hindi": "अपनी किताब खोलो",
     "expected_sat": None, "note": "Open your book"},
    {"id": "fln_cls_002", "category": "instruction",
     "hindi": "शांत रहो और सुनो",
     "expected_sat": None, "note": "Be quiet and listen"},
    {"id": "fln_cls_003", "category": "assessment",
     "hindi": "यह बताओ कि इसका जवाब क्या है",
     "expected_sat": None, "note": "Tell me the answer"},
    # ---- NIPUN Bharat specific ----
    {"id": "fln_nipun_001", "category": "nipun",
     "hindi": "निपुण भारत लक्ष्य प्राप्त करना है",
     "expected_sat": None, "note": "NIPUN Bharat goal"},
    {"id": "fln_nipun_002", "category": "nipun",
     "hindi": "बुनियादी साक्षरता और संख्या ज्ञान",
     "expected_sat": None, "note": "FLN core term"},
    # ---- Worksheet prompts ----
    {"id": "fln_ws_001", "category": "worksheet",
     "hindi": "खाली जगह भरो",
     "expected_sat": None, "note": "Fill in the blank"},
    {"id": "fln_ws_002", "category": "worksheet",
     "hindi": "सही जवाब पर गोला लगाओ",
     "expected_sat": None, "note": "Circle the correct answer"},
]


def run_fln_tests(model_base: str, output_path: str) -> None:
    print(f"\n{'='*60}")
    print("Janbhasha - Phase 9 FLN Test")
    print(f"{'='*60}")

    nmt_path = os.path.join(model_base, "translation", "indictrans2-en-santali")
    nmt_available = os.path.isdir(nmt_path)
    print(f"  NMT model: {'FOUND' if nmt_available else 'NOT FOUND'} ({nmt_path})")

    engine = None
    if nmt_available:
        try:
            from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
            import torch
            tok = AutoTokenizer.from_pretrained(nmt_path, local_files_only=True,
                                                trust_remote_code=True)
            mdl = AutoModelForSeq2SeqLM.from_pretrained(nmt_path,
                                                         local_files_only=True,
                                                         trust_remote_code=True)
            mdl.eval()
            engine = {"tok": tok, "mdl": mdl}
            print("  NMT engine: LOADED")
        except Exception as e:
            print(f"  NMT engine: LOAD FAILED - {e}")

    results = []
    for tc in FLN_TEST_CASES:
        uid      = tc["id"]
        category = tc["category"]
        hindi    = tc["hindi"]
        t0 = time.perf_counter()
        hypothesis, error = None, None

        if engine:
            try:
                import torch
                inputs = engine["tok"](f"[hi_Deva] {hindi}", return_tensors="pt")
                with torch.no_grad():
                    out = engine["mdl"].generate(**inputs, max_length=128)
                hypothesis = engine["tok"].decode(out[0], skip_special_tokens=True)
            except Exception as e:
                error = str(e)
        else:
            error = "MODEL_NOT_LOADED"

        latency_ms = int((time.perf_counter() - t0) * 1000)
        status = "PASS" if hypothesis else "NOT_TESTED" if not nmt_available else "FAIL"
        print(f"  [{uid}] {status:<12} cat={category} lat={latency_ms}ms")
        if hindi:       print(f"    HI:  {hindi}")
        if hypothesis:  print(f"    SAT: {hypothesis}")

        results.append({
            "id": uid, "category": category,
            "hindi": hindi, "hypothesis": hypothesis,
            "expected_sat": tc["expected_sat"],
            "latency_ms": latency_ms,
            "status": status, "error": error,
            "human_eval": "NOT_TESTED",
            "educational_intent_preserved": "NOT_TESTED",
        })

    passed = sum(1 for r in results if r["status"] == "PASS")
    summary = {
        "total": len(results), "passed": passed,
        "not_tested": sum(1 for r in results if r["status"] == "NOT_TESTED"),
        "failed": sum(1 for r in results if r["status"] == "FAIL"),
        "human_eval_required": True,
        "note": "FLN translations require human evaluation by tribal language speaker",
        "tested_at": datetime.utcnow().isoformat() + "Z",
    }
    output = {"summary": summary, "results": results}
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n  PASSED: {passed}/{len(results)}  |  Results: {output_path}")
    print(f"  HUMAN EVAL REQUIRED for all FLN translations")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--model_base", default="models/")
    p.add_argument("--output", default="tests/fln/results.json")
    args = p.parse_args()
    run_fln_tests(args.model_base, args.output)
