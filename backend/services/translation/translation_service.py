"""
Translation Service - IndicTrans2 + Dictionary Fallback
Supports Hindi ↔ Santali, Odia, Ho, Mundari, English (offline)
"""
import asyncio
import logging
from typing import Optional
from database.db import fetchone, execute
from services.translation.dictionary_fallback import DictionaryFallback

logger = logging.getLogger("janbhasha.translate")

# IndicTrans2 supported language pairs
INDICTRANS_SUPPORTED = {
    ("hi", "en"), ("en", "hi"),
    ("hi", "or"), ("or", "hi"),
    ("hi", "sat"), ("sat", "hi"),
    ("hi", "bn"), ("hi", "te"), ("hi", "ta"),
    ("hi", "gu"), ("hi", "mr"), ("hi", "kn"), ("hi", "ml"), ("hi", "pa"),
}

# Languages using dictionary fallback only
DICTIONARY_ONLY = {"ho", "mun"}


class TranslationService:
    def __init__(self, model_manager):
        self.manager = model_manager
        self._indictrans = None
        self._tokenizer = None
        self._model_loaded = False
        self.fallback = DictionaryFallback()

    async def _ensure_indictrans(self) -> bool:
        """Lazy-load IndicTrans2 model on first use."""
        if self._model_loaded:
            return self._indictrans is not None
        self._model_loaded = True
        try:
            from pathlib import Path
            import os
            model_path = Path(os.getenv("AI_MODELS_PATH", "../ai_models")) / "indictrans2"
            if not model_path.exists():
                logger.warning("IndicTrans2 model not found. Using dictionary fallback.")
                return False
            # Try loading via ctranslate2
            import ctranslate2
            import sentencepiece as spm
            sp_model = model_path / "sentencepiece.model"
            if not sp_model.exists():
                logger.warning("IndicTrans2 sentencepiece.model not found.")
                return False
            loop = asyncio.get_event_loop()
            self._tokenizer = await loop.run_in_executor(None, lambda: spm.SentencePieceProcessor(str(sp_model)))
            self._indictrans = await loop.run_in_executor(
                None,
                lambda: ctranslate2.Translator(str(model_path), device="cpu", inter_threads=1)
            )
            logger.info("✅ IndicTrans2 loaded")
            return True
        except ImportError:
            logger.warning("ctranslate2 not installed. Using dictionary fallback.")
            return False
        except Exception as e:
            logger.warning(f"IndicTrans2 load error: {e}. Using dictionary fallback.")
            return False

    async def translate(self, text: str, source_lang: str, target_lang: str, use_cache: bool = True) -> dict:
        """Main translation entry point with caching."""
        # Check DB cache first
        if use_cache:
            cached = await fetchone(
                "SELECT target_text FROM translations WHERE source_text=? AND source_lang=? AND target_lang=?",
                (text, source_lang, target_lang)
            )
            if cached:
                return {
                    "translated_text": cached["target_text"],
                    "source_lang": source_lang,
                    "target_lang": target_lang,
                    "method": "cache"
                }

        # Determine translation method
        pair = (source_lang, target_lang)
        method = "unknown"
        translated = text  # Safe fallback: return original

        if source_lang == target_lang:
            return {"translated_text": text, "source_lang": source_lang, "target_lang": target_lang, "method": "passthrough"}

        if target_lang in DICTIONARY_ONLY or source_lang in DICTIONARY_ONLY:
            translated = await self.fallback.translate(text, source_lang, target_lang)
            method = "dictionary"
        elif pair in INDICTRANS_SUPPORTED:
            has_model = await self._ensure_indictrans()
            if has_model:
                translated = await self._indictrans_translate(text, source_lang, target_lang)
                method = "indictrans2"
            else:
                translated = await self.fallback.translate(text, source_lang, target_lang)
                method = "dictionary_fallback"
        else:
            translated = await self.fallback.translate(text, source_lang, target_lang)
            method = "dictionary"

        # Cache result
        if use_cache and translated != text:
            try:
                await execute(
                    """INSERT OR IGNORE INTO translations (source_text, source_lang, target_text, target_lang, model_used)
                       VALUES (?,?,?,?,?)""",
                    (text, source_lang, translated, target_lang, method)
                )
            except Exception:
                pass

        return {
            "translated_text": translated,
            "source_lang": source_lang,
            "target_lang": target_lang,
            "method": method
        }

    async def _indictrans_translate(self, text: str, source_lang: str, target_lang: str) -> str:
        """Translate using IndicTrans2 model."""
        try:
            # IndicTrans2 uses language codes with script tags
            lang_map = {
                "hi": "hin_Deva", "en": "eng_Latn",
                "or": "ory_Orya", "sat": "sat_Olck",
                "bn": "ben_Beng", "te": "tel_Telu", "ta": "tam_Taml",
            }
            src_code = lang_map.get(source_lang, "hin_Deva")
            tgt_code = lang_map.get(target_lang, "eng_Latn")
            input_text = f"{src_code} {text}"

            loop = asyncio.get_event_loop()
            tokens = await loop.run_in_executor(None, lambda: self._tokenizer.encode(input_text, out_type=str))
            results = await loop.run_in_executor(
                None,
                lambda: self._indictrans.translate_batch(
                    [tokens],
                    target_prefix=[[tgt_code]],
                    max_decoding_length=512,
                    beam_size=4,
                )
            )
            output_tokens = results[0].hypotheses[0][1:]  # Skip target lang token
            translated = self._tokenizer.decode(output_tokens)
            return translated.strip()
        except Exception as e:
            logger.error(f"IndicTrans2 translation error: {e}")
            return text  # Return original on failure
