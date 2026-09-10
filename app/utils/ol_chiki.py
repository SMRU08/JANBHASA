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

# Devanagari to Ol Chiki phonetic transliteration tables
DEVA_CONSONANTS: Dict[str, str] = {
    'क': 'ᱠ', 'ख': 'ᱠᱷ', 'ग': 'ᱜ', 'घ': 'ᱜᱷ', 'ङ': 'ᱝ',
    'च': 'ᱪ', 'छ': 'ᱪᱷ', 'ज': 'ᱡ', 'झ': 'ᱡᱷ', 'ञ': 'ᱧ',
    'ट': 'ᱴ', 'ठ': 'ᱴᱷ', 'ड': 'ᱰ', 'ढ': 'ᱰᱷ', 'ण': 'ᱬ',
    'त': 'ᱛ', 'थ': 'ᱛᱷ', 'द': 'ᱫ', 'ध': 'ᱫᱷ', 'न': 'ᱱ',
    'प': 'ᱯ', 'फ': 'ᱯᱷ', 'ब': 'ᱵ', 'भ': 'ᱵᱷ', 'म': 'ᱢ',
    'य': 'ᱭ', 'र': 'ᱨ', 'ल': 'ᱞ', 'व': 'ᱣ',
    'श': 'ᱥ', 'ष': 'ᱥ', 'स': 'ᱥ', 'ह': 'ᱦ',
    'ड़': 'ᱲ', 'ढ़': 'ᱲᱷ', 'क़': 'ᱠ', 'ख़': 'ᱠᱷ', 'ग़': 'ᱜ', 'ज़': 'ᱡ', 'फ़': 'ᱯᱷ'
}

DEVA_VOWELS: Dict[str, str] = {
    'अ': 'ᱚ', 'आ': 'ᱟ', 'इ': 'ᱤ', 'ई': 'ᱤ', 'उ': 'ᱩ', 'ऊ': 'ᱩ',
    'ऋ': 'ᱨᱤ', 'ए': 'ᱮ', 'ऐ': 'ᱮ', 'ओ': 'ᱳ', 'औ': 'ᱳ'
}

DEVA_MATRAS: Dict[str, str] = {
    'ा': 'ᱟ', 'ि': 'ᱤ', 'ी': 'ᱤ', 'ु': 'ᱩ', 'ू': 'ᱩ',
    'ृ': 'ᱨᱤ', 'े': 'ᱮ', 'ै': 'ᱮ', 'ो': 'ᱳ', 'ौ': 'ᱳ'
}

DEVA_MODIFIERS: Dict[str, str] = {
    'ं': 'ᱸ', 'ँ': 'ᱶ', 'ः': 'ᱺ', '्': '', '।': '᱾', '॥': '᱿'
}

DEVA_DIGITS: Dict[str, str] = {
    '0': '᱐', '1': '᱑', '2': '᱒', '3': '᱓', '4': '᱔', '5': '᱕', '6': '᱖', '7': '᱗', '8': '᱘', '9': '᱙',
    '०': '᱐', '१': '᱑', '२': '᱒', '३': '᱓', '४': '᱔', '५': '᱕', '६': '᱖', '७': '᱗', '८': '᱘', '९': '᱙'
}

def deva_to_olchiki(text: str) -> str:
    """
    Phonetically transliterates Devanagari text into authentic Santali Ol Chiki Unicode (U+1C50-U+1C7F).
    Handles consonants, independent vowels, dependent matras, modifiers, punctuation, and digits.
    """
    if not text:
        return ""

    res = []
    i = 0
    n = len(text)
    while i < n:
        c = text[i]

        # Check two-character combos (e.g., nukta letters like ड़, ढ़, क़, etc.)
        if i + 1 < n and text[i:i+2] in DEVA_CONSONANTS:
            res.append(DEVA_CONSONANTS[text[i:i+2]])
            # Check if followed by matra or virama
            if i + 2 < n and text[i+2] in DEVA_MATRAS:
                res.append(DEVA_MATRAS[text[i+2]])
                i += 3
                continue
            elif i + 2 < n and text[i+2] == '्':
                i += 3
                continue
            else:
                res.append('ᱚ')
                i += 2
                continue

        if c in DEVA_CONSONANTS:
            res.append(DEVA_CONSONANTS[c])
            # Check if followed by matra or virama
            if i + 1 < n and text[i+1] in DEVA_MATRAS:
                res.append(DEVA_MATRAS[text[i+1]])
                i += 2
                continue
            elif i + 1 < n and text[i+1] == '्':
                i += 2
                continue
            else:
                # Inherent vowel 'a' / 'ᱚ'
                res.append('ᱚ')
                i += 1
                continue
        elif c in DEVA_VOWELS:
            res.append(DEVA_VOWELS[c])
        elif c in DEVA_MATRAS:
            res.append(DEVA_MATRAS[c])
        elif c in DEVA_MODIFIERS:
            res.append(DEVA_MODIFIERS[c])
        elif c in DEVA_DIGITS:
            res.append(DEVA_DIGITS[c])
        else:
            res.append(c)
        i += 1

    return ''.join(res)

