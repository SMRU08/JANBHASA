"""
Ol Chiki (Santhali) Unicode and Transliteration Utilities.
Ol Chiki Unicode Range: U+1C50 to U+1C7F
Provides script detection, basic transliteration mappings (Latin/Devanagari <-> Ol Chiki),
and character normalization.
"""
import re
from typing import Dict, Tuple

OL_CHIKI_RANGE = (0x1C50, 0x1C7F)

# Basic character mapping table between Latin approximation and Ol Chiki
LATIN_TO_OL_CHIKI: Dict[str, str] = {
    "la": "ᱞ", "at": "ᱛ", "ak": "ᱠ", "aj": "ᱡ", "am": "ᱢ",
    "aw": "ᱣ", "is": "ᱥ", "ih": "ᱦ", "ny": "ᱧ", "or": "ᱨ",
    "uc": "ᱪ", "ud": "ᱫ", "en": "ᱬ", "ep": "ᱯ", "ed": "ᱰ",
    "a": "ᱚ", "t": "ᱛ", "g": "ᱜ", "ng": "ᱝ", "l": "ᱞ",
    "k": "ᱠ", "j": "ᱡ", "m": "ᱢ", "w": "ᱣ", "s": "ᱥ",
    "h": "ᱦ", "r": "ᱨ", "c": "ᱪ", "d": "ᱫ", "p": "ᱯ",
    "n": "ᱱ", "b": "ᱵ", "y": "ᱭ", "e": "ᱮ", "o": "ᱳ",
    "i": "ᱤ", "u": "ᱩ"
}

def is_ol_chiki(char: str) -> bool:
    """Check if a character falls within the Ol Chiki Unicode block."""
    if not char:
        return False
    return OL_CHIKI_RANGE[0] <= ord(char[0]) <= OL_CHIKI_RANGE[1]

def detect_script_composition(text: str) -> Dict[str, float]:
    """
    Calculate the percentage composition of scripts in a bilingual/code-mixed input.
    Returns proportions for: 'ol_chiki', 'devanagari', 'latin', 'other'.
    """
    if not text:
        return {"ol_chiki": 0.0, "devanagari": 0.0, "latin": 0.0, "other": 0.0}

    counts = {"ol_chiki": 0, "devanagari": 0, "latin": 0, "other": 0}
    total = 0

    for ch in text:
        if ch.isspace():
            continue
        code = ord(ch)
        total += 1
        if OL_CHIKI_RANGE[0] <= code <= OL_CHIKI_RANGE[1]:
            counts["ol_chiki"] += 1
        elif 0x0900 <= code <= 0x097F:
            counts["devanagari"] += 1
        elif (0x0041 <= code <= 0x005A) or (0x0061 <= code <= 0x007A):
            counts["latin"] += 1
        else:
            counts["other"] += 1

    if total == 0:
        return {"ol_chiki": 0.0, "devanagari": 0.0, "latin": 0.0, "other": 0.0}

    return {k: round(v / total, 3) for k, v in counts.items()}

def normalize_santhali_text(text: str) -> str:
    """Clean whitespace, standard punctuation, and extraneous artifacts."""
    text = re.sub(r'\s+', ' ', text).strip()
    return text
