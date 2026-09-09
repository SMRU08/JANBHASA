#!/usr/bin/env python3
"""
Janbhasha Phase 4 — End-to-End Pipeline Orchestrator
Chains: ASR → NLP Bilingual Preprocessing → IndicTrans2 Translation → VITS TTS

Threading strategy:
  - AI inference (Whisper, IndicTrans2, VITS) is CPU/GPU-bound.
  - FastAPI's async event loop must not be blocked by synchronous torch ops.
  - All heavy inference calls are delegated to a ThreadPoolExecutor via
    asyncio.get_event_loop().run_in_executor(), keeping the ASGI loop free
    to accept new requests during processing.
"""

import asyncio
import os
import time
from concurrent.futures import ThreadPoolExecutor
from functools import partial
from pathlib import Path
from typing import Any, Dict, Optional, Union

os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")
os.environ.setdefault("HF_DATASETS_OFFLINE", "1")
os.environ.setdefault("HF_HUB_OFFLINE", "1")

from loguru import logger

from app.services.asr_service import JanbhashaASRService
from app.services.nlp_service import nlp_service
from app.services.translation_service import JanbhashaTranslationService
from app.services.tts_service import JanbhashaTTSService

# Whisper 2-char lang codes → IndicTrans2 full codes
WHISPER_TO_IT2: Dict[str, str] = {
    "hi": "hin_Deva",
    "en": "eng_Latn",
    "sat": "sat_Olck",
    "bn": "ben_Beng",
    "te": "tel_Telu",
    "ta": "tam_Taml",
    "mr": "mar_Deva",
    "gu": "guj_Gujr",
    "pa": "pan_Guru",
    "kn": "kan_Knda",
    "ml": "mal_Mlym",
    "or": "ory_Orya",
    "as": "asm_Beng",
    "ur": "urd_Arab",
}

# Shared thread-pool for all blocking inference calls (CPU/GPU-bound)
_INFERENCE_POOL = ThreadPoolExecutor(
    max_workers=2,
    thread_name_prefix="janbhasha-inference"
)


async def _run_in_thread(fn, *args, **kwargs):
    """Runs a blocking callable inside the shared thread-pool without blocking the event loop."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(_INFERENCE_POOL, partial(fn, *args, **kwargs))


# ──────────────────────────────────────────────────────────────────────────────
class JanbhashaPipelineService:
    """
    Async-safe End-to-End Pipeline Orchestrator.

    Receives live references to the three AI service singletons (injected
    at server startup via FastAPI lifespan). All heavy model calls are
    dispatched to a ThreadPoolExecutor so the ASGI event loop stays
    non-blocking.

    Routing:
      text-in  → NLP  → Translation → TTS → {json + audio_base64}
      audio-in → ASR → NLP → Translation → TTS → {json + audio_base64}
    """

    def __init__(
        self,
        asr: JanbhashaASRService,
        translation: JanbhashaTranslationService,
        tts: JanbhashaTTSService,
    ):
        self.asr = asr
        self.translation = translation
        self.tts = tts
        logger.info("[Pipeline] Orchestrator initialized with live AI service references.")

    # ──────────────────────────────────────────────────────────────────────
    async def process_text(
        self,
        text: str,
        source_lang: str = "hin_Deva",
        target_lang: str = "sat_Olck",
        return_audio: bool = True,
        speaker_id: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Async text pipeline: NLP clean → IndicTrans2 translate → VITS synthesize.
        All blocking torch ops run in the inference thread-pool.
        """
        wall_start = time.perf_counter()
        logger.info(f"[Pipeline/Text] '{text[:60]}' | {source_lang} → {target_lang}")

        if not text or not text.strip():
            logger.info("[Pipeline/Text] Received empty or whitespace-only input text.")
            total_ms = round((time.perf_counter() - wall_start) * 1000, 2)
            return {
                "input_text": text or "",
                "preprocessed_text": "",
                "is_code_mixed": False,
                "translated_text": "",
                "source_lang": source_lang,
                "target_lang": target_lang,
                "audio_base64": None,
                "audio_sample_rate": None,
                "audio_duration_seconds": None,
                "asr_transcript": None,
                "asr_detected_language": None,
                "asr_language_probability": None,
                "processing_time_ms": total_ms,
            }

        # ── Step 1: NLP Bilingual Preprocessing (lightweight, runs inline) ─
        nlp_out = nlp_service.analyze_and_clean(text, target_lang=target_lang)
        preprocessed = nlp_out["normalized_for_translation"]
        logger.debug(f"[Pipeline/Text] NLP → '{preprocessed[:60]}'")

        # ── Step 2: Offline Translation (blocking torch) ───────────────────
        trans_result = await _run_in_thread(
            self.translation.translate,
            preprocessed,
            source_lang,
            target_lang,
        )
        translated: str = trans_result["translated_text"]
        if isinstance(translated, list):
            translated = translated[0]
        logger.debug(f"[Pipeline/Text] Translated → '{translated[:60]}'")

        # ── Step 3: VITS Speech Synthesis (blocking torch) ────────────────
        audio_b64 = None
        sample_rate = None
        audio_dur = None

        if return_audio:
            tts_result = await _run_in_thread(
                self.tts.synthesize,
                translated,
                speaker_id,
            )
            audio_b64 = tts_result["audio_base64"]
            sample_rate = tts_result["sample_rate"]
            audio_dur = tts_result["duration_seconds"]

        total_ms = round((time.perf_counter() - wall_start) * 1000, 2)
        logger.success(f"[Pipeline/Text] Complete in {total_ms}ms")

        return {
            "input_text": text,
            "preprocessed_text": preprocessed,
            "is_code_mixed": nlp_out["is_code_mixed"],
            "translated_text": translated,
            "source_lang": source_lang,
            "target_lang": target_lang,
            "audio_base64": audio_b64,
            "audio_sample_rate": sample_rate,
            "audio_duration_seconds": audio_dur,
            "asr_transcript": None,
            "asr_detected_language": None,
            "asr_language_probability": None,
            "processing_time_ms": total_ms,
        }

    # ──────────────────────────────────────────────────────────────────────
    async def process_audio(
        self,
        audio_file_path: str,
        asr_language: Optional[str] = None,
        target_lang: str = "sat_Olck",
        return_audio: bool = True,
        speaker_id: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Async audio pipeline: Whisper ASR → NLP → IndicTrans2 → VITS.
        """
        wall_start = time.perf_counter()
        logger.info(f"[Pipeline/Audio] '{audio_file_path}' | asr_lang={asr_language or 'auto'} → {target_lang}")

        # ── Step 0: Speech Recognition (blocking CTranslate2) ─────────────
        asr_result = await _run_in_thread(
            self.asr.transcribe,
            audio_file_path,
            asr_language,
        )
        raw_transcript: str = asr_result["transcription"]
        detected_lang: str = asr_result["detected_language"]
        source_lang = WHISPER_TO_IT2.get(detected_lang, "hin_Deva")
        logger.debug(f"[Pipeline/Audio] ASR → '{raw_transcript[:60]}' (lang={detected_lang})")

        # ── Steps 1-3: Delegate to text pipeline from transcript ───────────
        text_result = await self.process_text(
            text=raw_transcript,
            source_lang=source_lang,
            target_lang=target_lang,
            return_audio=return_audio,
            speaker_id=speaker_id,
        )

        total_ms = round((time.perf_counter() - wall_start) * 1000, 2)

        return {
            **text_result,
            "asr_transcript": raw_transcript,
            "asr_detected_language": detected_lang,
            "asr_language_probability": asr_result.get("language_probability"),
            "processing_time_ms": total_ms,
        }

    # ──────────────────────────────────────────────────────────────────────
    async def translate_only(
        self,
        text: str,
        source_lang: str = "hin_Deva",
        target_lang: str = "sat_Olck",
    ) -> Dict[str, Any]:
        """NLP clean → translate only — no TTS. Useful for text-translation widgets."""
        if not text or not text.strip():
            return {
                "source_text": text or "",
                "normalized_text": "",
                "translated_text": "",
                "source_lang": source_lang,
                "target_lang": target_lang,
                "model_version": Path(self.translation.model_path).name,
                "inference_time_ms": 0.0,
            }

        nlp_out = nlp_service.analyze_and_clean(text, target_lang=target_lang)
        trans_result = await _run_in_thread(
            self.translation.translate,
            nlp_out["normalized_for_translation"],
            source_lang,
            target_lang,
        )
        return {
            "source_text": text,
            "normalized_text": nlp_out["normalized_for_translation"],
            "translated_text": trans_result["translated_text"],
            "source_lang": source_lang,
            "target_lang": target_lang,
            "model_version": trans_result.get("model_version", ""),
            "inference_time_ms": trans_result.get("inference_time_ms", 0.0),
        }
