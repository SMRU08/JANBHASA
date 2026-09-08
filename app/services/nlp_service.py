import sys
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

import os
from pathlib import Path
from typing import Dict, Any, Optional
from scripts.query_preprocessor import BilingualQueryPreprocessor

class NLPService:
    def __init__(self):
        lexicon_file = Path(__file__).resolve().parent.parent.parent / "data" / "lexicons" / "bharatavani" / "santhali_bharatavani_lexicon.json"
        self.preprocessor = BilingualQueryPreprocessor(lexicon_path=str(lexicon_file) if lexicon_file.exists() else None)

    def analyze_and_clean(self, text: str, target_lang: str = "sat_Olck") -> Dict[str, Any]:
        result = self.preprocessor.process_query(raw_query=text, target_lang=target_lang)
        
        # Build backward-compatible response for schemas
        script_comp = {}
        total = len(result["tagged_tokens"]) or 1
        for t in result["tagged_tokens"]:
            sc = t["script"]
            script_comp[sc] = script_comp.get(sc, 0) + 1
        composition = {k: round(v / total, 3) for k, v in script_comp.items()}

        token_tags = [
            {"token": t["token"], "script": t["script"], "language_hint": t.get("lang_hint")}
            for t in result["tagged_tokens"]
        ]

        return {
            "original_text": result["raw_query"],
            "cleaned_text": result["cleaned_query"],
            "is_code_mixed": result["is_code_mixed"],
            "script_composition": composition,
            "token_tags": token_tags,
            "normalized_for_translation": result["normalized_query"]
        }

nlp_service = NLPService()
