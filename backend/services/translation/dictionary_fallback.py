"""
Dictionary-based fallback translation for tribal languages: Santali, Ho, Mundari, Odia, Hindi, English.
Loads from data/dictionaries/multilingual_dictionary.json and DB dictionary table.
"""
import os
import json
import logging
from pathlib import Path
from database.db import fetchone

logger = logging.getLogger("janbhasha.dict_fallback")

DICT_FILE = Path(__file__).parent.parent.parent.parent / "data" / "dictionaries" / "multilingual_dictionary.json"

# In-memory dictionary pairs: (source_lang, target_lang) -> { source_word: target_word }
DYNAMIC_DICTS = {}

def load_dictionaries():
    """Load JSON dictionary dataset and build cross-language mappings."""
    global DYNAMIC_DICTS
    DYNAMIC_DICTS = {}

    if not DICT_FILE.exists():
        logger.warning(f"Dictionary file not found at {DICT_FILE}")
        return

    try:
        data = json.loads(DICT_FILE.read_text(encoding="utf-8"))
        languages = ["en", "hi", "or", "sat", "ho", "mun"]

        for src in languages:
            for tgt in languages:
                if src == tgt:
                    continue
                pair = (src, tgt)
                mapping = {}
                for item in data:
                    src_val = item.get(src, "").strip().lower()
                    tgt_val = item.get(tgt, "").strip()
                    if src_val and tgt_val:
                        mapping[src_val] = tgt_val
                        # Also preserve original case in mapping
                        raw_src = item.get(src, "").strip()
                        mapping[raw_src] = tgt_val
                DYNAMIC_DICTS[pair] = mapping

        logger.info(f"✅ Loaded {len(data)} multilingual dictionary entries across {len(DYNAMIC_DICTS)} language pairs.")
    except Exception as e:
        logger.error(f"Failed to load dictionary: {e}")

# Initial load
load_dictionaries()


class DictionaryFallback:
    async def translate(self, text: str, source_lang: str, target_lang: str) -> str:
        """
        Translates text word-by-word or phrase-by-phrase using curated tribal dictionaries.
        """
        if not text or source_lang == target_lang:
            return text

        pair = (source_lang, target_lang)

        # 1. Check exact phrase in database table first
        try:
            db_result = await fetchone(
                "SELECT translation FROM dictionary WHERE (word=? OR word=?) AND source_lang=? AND target_lang=?",
                (text.strip(), text.strip().lower(), source_lang, target_lang)
            )
            if db_result:
                return db_result["translation"]
        except Exception:
            pass

        # 2. Check full phrase in JSON dictionary
        dict_map = DYNAMIC_DICTS.get(pair, {})
        clean_text = text.strip()
        if clean_text in dict_map:
            return dict_map[clean_text]
        if clean_text.lower() in dict_map:
            return dict_map[clean_text.lower()]

        # 3. Word-by-word translation
        words = text.split()
        translated_words = []
        for word in words:
            clean = word.strip("।.,?!;:'\"")
            lower_clean = clean.lower()

            if clean in dict_map:
                translated_words.append(dict_map[clean])
            elif lower_clean in dict_map:
                translated_words.append(dict_map[lower_clean])
            else:
                translated_words.append(word)

        return " ".join(translated_words)
