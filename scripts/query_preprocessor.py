#!/usr/bin/env python3
"""
Janbhasha Bilingual & Mixed-Language Query NLP Pre-processor.
Handles code-switching, Romanized transliteration mapping, Bharatavani lexicon normalization,
and formats input specifically for AI4Bharat IndicTrans2 offline inference.
"""

import sys
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass
import os
import re
import json
import argparse
from pathlib import Path
from typing import Dict, List, Any, Optional

# Supported language codes under IndicTrans2
INDICTRANS2_CODES = {
    "santhali": "sat_Olck",
    "hindi": "hin_Deva",
    "english": "eng_Latn"
}

class BilingualQueryPreprocessor:
    """
    Production-ready pipeline to ingest raw bilingual/code-mixed user queries,
    detect code-switching points, normalize script representations, apply Bharatavani
    standardized lexicons, and prepare optimal input for IndicTrans2.
    """

    def __init__(self, lexicon_path: Optional[str] = None):
        self.lexicon = {}
        if lexicon_path and os.path.exists(lexicon_path):
            self.load_lexicon(lexicon_path)
        else:
            default_path = Path(__file__).resolve().parent.parent / "data" / "lexicons" / "bharatavani" / "santhali_bharatavani_lexicon.json"
            if default_path.exists():
                self.load_lexicon(str(default_path))

    def load_lexicon(self, path: str):
        """Loads domain/Bharatavani glossary for terminology mapping."""
        with open(path, "r", encoding="utf-8-sig") as f:
            data = json.load(f)
            self.lexicon = data.get("lexicon", {})
        print(f"[NLP] Loaded {len(self.lexicon)} lexicon entries from {path}")

    @staticmethod
    def identify_char_script(char: str) -> str:
        code = ord(char)
        if 0x1C50 <= code <= 0x1C7F:
            return "ol_chiki"
        elif 0x0900 <= code <= 0x097F:
            return "devanagari"
        elif (0x0041 <= code <= 0x005A) or (0x0061 <= code <= 0x007A):
            return "latin"
        elif char.isdigit():
            return "digit"
        elif char.isspace():
            return "whitespace"
        else:
            return "punctuation"

    def analyze_token_scripts(self, tokens: List[str]) -> List[Dict[str, Any]]:
        """Classifies each token into its predominant script and language identity."""
        tagged_tokens = []
        for tok in tokens:
            script_counts = {"ol_chiki": 0, "devanagari": 0, "latin": 0, "digit": 0, "punctuation": 0}
            for ch in tok:
                sc = self.identify_char_script(ch)
                if sc in script_counts:
                    script_counts[sc] += 1

            total = sum(script_counts.values())
            predominant = max(script_counts, key=script_counts.get) if total > 0 else "punctuation"

            # Assign language hint based on script
            lang_hint = "unknown"
            if predominant == "ol_chiki":
                lang_hint = "sat_Olck"
            elif predominant == "devanagari":
                lang_hint = "hin_Deva"
            elif predominant == "latin":
                lang_hint = "eng_Latn_or_Romanized"

            tagged_tokens.append({
                "token": tok,
                "script": predominant,
                "lang_hint": lang_hint
            })
        return tagged_tokens

    def apply_lexicon_normalization(self, tagged_tokens: List[Dict[str, Any]], target_lang: str = "sat_Olck") -> List[str]:
        """
        Replaces colloquial/loanword tokens with official Bharatavani terms.
        If target is Santhali, maps English/Hindi loanwords to standard Ol Chiki terms.
        """
        normalized = []
        for item in tagged_tokens:
            tok_lower = item["token"].lower()
            if tok_lower in self.lexicon:
                lex_entry = self.lexicon[tok_lower]
                if target_lang == "sat_Olck" and "sat_olck" in lex_entry:
                    normalized.append(lex_entry["sat_olck"])
                    continue
                elif target_lang == "hin_Deva" and "hin_deva" in lex_entry:
                    # Select primary Hindi synonym
                    normalized.append(lex_entry["hin_deva"].split("/")[0].strip())
                    continue
            normalized.append(item["token"])
        return normalized

    def format_for_indictrans2(
        self,
        cleaned_text: str,
        src_lang: str = "hin_Deva",
        tgt_lang: str = "sat_Olck"
    ) -> Dict[str, Any]:
        """
        Formats normalized text into the exact token prompt expected by AI4Bharat IndicTrans2.
        IndicTrans2 models use special language tags e.g. '__src_lang__' and '__tgt_lang__'.
        """
        prompt = f"__{src_lang}__ {cleaned_text} __{tgt_lang}__"
        return {
            "model_input_text": cleaned_text,
            "indictrans2_prompt": prompt,
            "src_lang": src_lang,
            "tgt_lang": tgt_lang
        }

    def process_query(
        self,
        raw_query: str,
        default_src_lang: str = "hin_Deva",
        target_lang: str = "sat_Olck"
    ) -> Dict[str, Any]:
        """
        Executes full preprocessing pipeline on a mixed-language user query.
        """
        # 1. Clean whitespace and non-printable noise
        cleaned = re.sub(r'\s+', ' ', raw_query).strip()

        # 2. Tokenize (word and punctuation aware)
        tokens = re.findall(r'\w+|[^\w\s]', cleaned, re.UNICODE)

        # 3. Analyze script distribution and code-switching points
        tagged_tokens = self.analyze_token_scripts(tokens)

        # 4. Detect code-mixing
        active_scripts = set(
            t["script"] for t in tagged_tokens
            if t["script"] in ["ol_chiki", "devanagari", "latin"]
        )
        is_code_mixed = len(active_scripts) > 1

        # Determine dominant source language if not strictly specified
        detected_src_lang = default_src_lang
        if is_code_mixed and "ol_chiki" in active_scripts and "devanagari" not in active_scripts:
            detected_src_lang = "sat_Olck"
        elif "devanagari" in active_scripts:
            detected_src_lang = "hin_Deva"

        # 5. Apply Bharatavani lexicon normalization
        normalized_tokens = self.apply_lexicon_normalization(tagged_tokens, target_lang=target_lang)
        normalized_text = " ".join(normalized_tokens)
        # Clean spacing around punctuation
        normalized_text = re.sub(r'\s+([,?.!;:।"॥])', r'\1', normalized_text)

        # 6. Prepare IndicTrans2 model payload
        indictrans2_payload = self.format_for_indictrans2(
            cleaned_text=normalized_text,
            src_lang=detected_src_lang,
            tgt_lang=target_lang
        )

        return {
            "raw_query": raw_query,
            "cleaned_query": cleaned,
            "is_code_mixed": is_code_mixed,
            "detected_scripts": list(active_scripts),
            "tagged_tokens": tagged_tokens,
            "normalized_query": normalized_text,
            "indictrans2_payload": indictrans2_payload
        }


if __name__ == "__main__":
    processor = BilingualQueryPreprocessor()
    test_queries = [
        "Mera naam Ramesh hai aur main school ja raha hoon",      # Hindi + English loanword
        "ᱡᱚᱦᱟᱨ! aapka hospital kahan hai?",                      # Ol Chiki + Hindi + English loanword
        "Aam do doctor then chalao me"                           # Romanized Santhali + English loanword
    ]

    print("=== Testing Bilingual Query Pre-processor ===")
    for q in test_queries:
        res = processor.process_query(q)
        print(f"\nRaw Input      : {res['raw_query']}")
        print(f"Code-Mixed     : {res['is_code_mixed']} (Scripts: {res['detected_scripts']})")
        print(f"Normalized     : {res['normalized_query']}")
        print(f"IndicTrans2 In : {res['indictrans2_payload']['indictrans2_prompt']}")


