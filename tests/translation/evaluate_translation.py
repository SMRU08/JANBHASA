"""
Phase 9 — Translation Evaluation Script
=========================================
Evaluates IndicTrans2 NMT on a controlled Hindi→Santali/Ho/Mundari dataset.

Metrics:
  - BLEU  (sacrebleu)
  - chrF  (character n-gram F-score — better for low-resource)
  - Exact Match rate
  - Failure rate
  - Human evaluation columns (marked NOT_TESTED until human review)

Usage:
  python tests/translation/evaluate_translation.py \
    --references tests/translation/translation_dataset.json \
    --model_path models/translation/indictrans2-en-santali \
    --src_lang hi --tgt_lang sat \
    --output tests/translation/results_hi_sat.json

IMPORTANT: BLEU is unreliable for very low-resource languages like
Santhali with small reference sets. chrF is preferred. Human evaluation
is MANDATORY for educational acceptance (marked in output as human_eval).
"""

import json
import os
import sys
import time
import argparse
from datetime import datetime
from typing import List, Dict, Optional


# ---- BLEU / chrF helpers (no sacrebleu dependency required) ---------

def compute_bleu_simple(references: List[str], hypotheses: List[str]) -> float:
    """
    Simplified sentence-level BLEU (4-gram) without smoothing.
    For accurate results, install sacrebleu:
      pip install sacrebleu
    and use sacrebleu.corpus_bleu() instead.
    """
    try:
        import sacrebleu
        result = sacrebleu.corpus_bleu(hypotheses, [references])
        return round(result.score, 2)
    except ImportError:
        pass

    # Fallback: unigram precision (very approximate)
    matches = 0
    total_hyp = 0
    for ref, hyp in zip(references, hypotheses):
        ref_tokens = set(ref.strip().lower().split())
        hyp_tokens = hyp.strip().lower().split()
        for t in hyp_tokens:
            if t in ref_tokens:
                matches += 1
        total_hyp += len(hyp_tokens)
    return round(matches / total_hyp * 100, 2) if total_hyp > 0 else 0.0


def compute_chrf(references: List[str], hypotheses: List[str]) -> float:
    """chrF character n-gram F-score — more stable for low-resource."""
    try:
        import sacrebleu
        result = sacrebleu.corpus_chrf(hypotheses, [references])
        return round(result.score, 2)
    except ImportError:
        pass

    # Fallback: character-level overlap
    total = 0.0
    for ref, hyp in zip(references, hypotheses):
        ref_chars = set(ref.replace(" ", ""))
        hyp_chars = set(hyp.replace(" ", ""))
        if not hyp_chars:
            continue
        precision = len(ref_chars & hyp_chars) / len(hyp_chars)
        recall    = len(ref_chars & hyp_chars) / len(ref_chars) if ref_chars else 0.0
        if precision + recall > 0:
            total += 2 * precision * recall / (precision + recall)
    return round(total / len(references) * 100, 2) if references else 0.0


def exact_match(reference: str, hypothesis: str) -> bool:
    return reference.strip().lower() == hypothesis.strip().lower()


# ---- Translation loader ---------------------------------------------

def load_translation_engine(model_path: str, src_lang: str, tgt_lang: str):
    """
    Load IndicTrans2 translation engine.
    Uses the IndicTransToolkit if available, otherwise ONNX Runtime.
    Returns None if model not found.
    """
    if not os.path.exists(model_path):
        print(f"[NMT] ERROR: Model not found at: {model_path}")
        print("       Run: python scripts/download_models.py --models all")
        return None

    # Try IndicTransToolkit (Python inference)
    try:
        from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
        import torch
        print(f"[NMT] Loading IndicTrans2 from: {model_path}")
        tokenizer = AutoTokenizer.from_pretrained(
            model_path, local_files_only=True, trust_remote_code=True)
        model = AutoModelForSeq2SeqLM.from_pretrained(
            model_path, local_files_only=True, trust_remote_code=True)
        model.eval()
        print("[NMT] Model loaded OK")
        return {"tokenizer": tokenizer, "model": model,
                "src_lang": src_lang, "tgt_lang": tgt_lang}
    except Exception as e:
        print(f"[NMT] Load error: {e}")
        return None


def translate_text(engine, text: str) -> tuple[Optional[str], int, Optional[str]]:
    """Translate a single string. Returns (translated, latency_ms, error)."""
    if engine is None:
        return None, 0, "MODEL_NOT_LOADED"

    t0 = time.perf_counter()
    try:
        import torch
        tokenizer = engine["tokenizer"]
        model     = engine["model"]
        src_lang  = engine["src_lang"]
        tgt_lang  = engine["tgt_lang"]

        # IndicTrans2 expects language-tagged input
        tagged = f"[{src_lang}_Deva] {text}"
        inputs = tokenizer(tagged, return_tensors="pt", padding=True)

        with torch.no_grad():
            output = model.generate(
                **inputs,
                forced_bos_token_id=tokenizer.lang_code_to_id.get(tgt_lang, None),
                max_length=256,
                num_beams=4,
            )
        translated = tokenizer.decode(output[0], skip_special_tokens=True)
        latency_ms = int((time.perf_counter() - t0) * 1000)
        return translated.strip(), latency_ms, None
    except Exception as e:
        latency_ms = int((time.perf_counter() - t0) * 1000)
        return None, latency_ms, str(e)


# ---- Main evaluation ------------------------------------------------

def evaluate(references_path: str, model_path: str,
             src_lang: str, tgt_lang: str, output_path: str) -> None:

    print(f"\n{'='*60}")
    print(f"Janbhasha — Phase 9 Translation Evaluation")
    print(f"  {src_lang.upper()} → {tgt_lang.upper()}")
    print(f"{'='*60}")

    with open(references_path, encoding="utf-8") as f:
        dataset: List[Dict] = json.load(f)

    # Filter for the requested language pair
    test_cases = [
        d for d in dataset
        if d.get("src_lang", src_lang) == src_lang
        and d.get("tgt_lang", tgt_lang) == tgt_lang
    ]
    print(f"[NMT] {len(test_cases)} test cases for {src_lang}→{tgt_lang}")

    if not test_cases:
        print("[NMT] No test cases found. Check dataset src_lang/tgt_lang fields.")
        sys.exit(1)

    engine = load_translation_engine(model_path, src_lang, tgt_lang)

    results = []
    all_refs, all_hyps = [], []
    total_latency = 0
    failures = 0
    exact_matches = 0

    for tc in test_cases:
        uid       = tc.get("id", "unknown")
        source    = tc["source"]
        reference = tc["reference"]
        category  = tc.get("category", "general")

        hypothesis, latency_ms, error = translate_text(engine, source)

        if error or hypothesis is None:
            failures += 1
            hypothesis = ""
            passed = False
        else:
            em = exact_match(reference, hypothesis)
            if em:
                exact_matches += 1
            passed = True  # presence of output = pass; quality reviewed separately

        total_latency += latency_ms
        all_refs.append(reference)
        all_hyps.append(hypothesis if hypothesis else "")

        status = "PASS" if passed else "FAIL"
        print(f"  [{uid}] {status}  latency={latency_ms}ms  cat={category}")
        if hypothesis:
            print(f"         SRC: {source}")
            print(f"         REF: {reference}")
            print(f"         HYP: {hypothesis}")

        results.append({
            "id": uid,
            "category": category,
            "source": source,
            "reference": reference,
            "hypothesis": hypothesis,
            "exact_match": exact_match(reference, hypothesis) if hypothesis else False,
            "latency_ms": latency_ms,
            "pass": passed,
            "error": error,
            "human_eval": "NOT_TESTED",  # to be filled by human evaluator
        })

    n = len(test_cases)
    bleu = compute_bleu_simple(all_refs, all_hyps)
    chrf = compute_chrf(all_refs, all_hyps)

    summary = {
        "src_lang": src_lang, "tgt_lang": tgt_lang,
        "total": n,
        "passed": n - failures,
        "failed": failures,
        "bleu": bleu,
        "chrf": chrf,
        "exact_match_rate": round(exact_matches / n, 4) if n > 0 else None,
        "avg_latency_ms": round(total_latency / n, 1) if n > 0 else None,
        "failure_rate": round(failures / n, 4) if n > 0 else None,
        "human_eval_required": True,
        "note": ("chrF is preferred over BLEU for low-resource languages. "
                 "Human evaluation required for educational acceptance."),
        "tested_at": datetime.utcnow().isoformat() + "Z",
    }

    output = {"summary": summary, "results": results}
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*60}")
    print(f"SUMMARY — {n} sentences evaluated ({src_lang}→{tgt_lang})")
    print(f"  BLEU:         {bleu}  (chrF preferred for low-resource)")
    print(f"  chrF:         {chrf}")
    print(f"  Exact match:  {exact_matches}/{n}")
    print(f"  Avg latency:  {summary['avg_latency_ms']} ms")
    print(f"  Failure rate: {summary['failure_rate']:.2%}" if summary['failure_rate'] is not None else "")
    print(f"  Human eval:   REQUIRED — not yet completed")
    print(f"  Results:      {output_path}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Janbhasha Translation Evaluation — Phase 9")
    parser.add_argument("--references", required=True)
    parser.add_argument("--model_path", required=True)
    parser.add_argument("--src_lang",   default="hi")
    parser.add_argument("--tgt_lang",   default="sat")
    parser.add_argument("--output",     default="tests/translation/results.json")
    args = parser.parse_args()
    evaluate(args.references, args.model_path, args.src_lang, args.tgt_lang, args.output)
