#!/usr/bin/env python3
"""
Phase 4 — /api/v1/pipeline endpoints
Full end-to-end REST endpoints for text-in and audio-in pipelines.
All heavy inference runs in a ThreadPoolExecutor (non-blocking ASGI).
"""

import os
import tempfile
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile, status
from fastapi.responses import JSONResponse

from app.schemas.pipeline import (
    PipelineResponse,
    PipelineTextRequest,
    ErrorResponse,
    VALID_INDICTRANS2_CODES,
    LANG_ALIASES,
)

router = APIRouter()

SUPPORTED_AUDIO_EXTENSIONS = {".wav", ".mp3", ".flac", ".ogg", ".m4a", ".opus"}


def _get_pipeline(request: Request):
    """Dependency: retrieves the pipeline service from FastAPI app state."""
    svc = getattr(request.app.state, "pipeline_service", None)
    if svc is None:
        raise HTTPException(
            status_code=503,
            detail="Pipeline service is not initialized. Server may still be loading models."
        )
    return svc


# ──────────────────────────────────────────────────────────────────────────────
@router.post(
    "/translate-text",
    response_model=PipelineResponse,
    responses={422: {"model": ErrorResponse}, 503: {"model": ErrorResponse}},
    summary="Text-to-text/audio pipeline (NLP → IndicTrans2 → VITS)",
    description=(
        "Accepts bilingual or code-mixed input text, applies NLP normalization, "
        "translates offline using IndicTrans2, and optionally synthesizes speech "
        "output using VITS. Returns translated text and/or Base64-encoded WAV audio."
    ),
)
async def translate_text_pipeline(
    payload: PipelineTextRequest,
    pipeline=Depends(_get_pipeline),
):
    result = await pipeline.process_text(
        text=payload.text,
        source_lang=payload.source_lang,
        target_lang=payload.target_lang,
        return_audio=payload.return_audio,
        speaker_id=payload.speaker_id,
    )
    return PipelineResponse(**result)


# ──────────────────────────────────────────────────────────────────────────────
@router.post(
    "/translate-audio",
    response_model=PipelineResponse,
    responses={
        400: {"model": ErrorResponse},
        422: {"model": ErrorResponse},
        503: {"model": ErrorResponse},
    },
    summary="Audio-to-text/audio pipeline (Whisper ASR → NLP → IndicTrans2 → VITS)",
    description=(
        "Accepts a raw audio file (WAV/MP3/FLAC/OGG), transcribes it offline "
        "using faster-whisper, applies NLP normalization, translates to the target "
        "language using IndicTrans2, and optionally synthesizes speech output with VITS."
    ),
)
async def translate_audio_pipeline(
    request: Request,
    file: UploadFile = File(..., description="Audio file (.wav, .mp3, .flac, .ogg, .m4a, .opus)"),
    asr_language: Optional[str] = Form(
        default=None,
        description="Whisper language hint (ISO 639-1, e.g. 'hi', 'en', 'sat'). "
                    "Omit for auto-detection."
    ),
    target_lang: str = Form(
        default="sat_Olck",
        description="IndicTrans2 target language code (e.g. 'sat_Olck', 'hin_Deva')"
    ),
    return_audio: bool = Form(
        default=True,
        description="If True, synthesizes translated text to speech (VITS)"
    ),
    speaker_id: Optional[int] = Form(
        default=None,
        description="VITS speaker ID for multi-speaker models"
    ),
    pipeline=Depends(_get_pipeline),
):
    # ── Validate audio file extension ──────────────────────────────────────
    suffix = os.path.splitext(file.filename or "audio.wav")[1].lower()
    if suffix not in SUPPORTED_AUDIO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported audio format '{suffix}'. "
                   f"Accepted: {sorted(SUPPORTED_AUDIO_EXTENSIONS)}"
        )

    # ── Sanitize Swagger form inputs ──────────────────────────────────────
    clean_asr_lang = asr_language.strip() if (asr_language and asr_language.strip()) else None
    if clean_asr_lang and clean_asr_lang.lower() in ("auto", "none", "null", "", "string"):
        clean_asr_lang = None

    clean_target_lang = target_lang.strip() if (target_lang and target_lang.strip()) else "sat_Olck"
    if clean_target_lang.lower() in ("string", "null", "none", ""):
        clean_target_lang = "sat_Olck"
    clean_target_lang = LANG_ALIASES.get(clean_target_lang, clean_target_lang)

    # ── Validate target language code ──────────────────────────────────────
    if clean_target_lang not in VALID_INDICTRANS2_CODES:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid target_lang '{clean_target_lang}'. "
                   f"Valid codes: {sorted(VALID_INDICTRANS2_CODES)}"
        )

    # ── Stream upload to temp file (avoids memory exhaustion) ─────────────
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        chunk_size = 256 * 1024   # 256 KB chunks
        while True:
            chunk = await file.read(chunk_size)
            if not chunk:
                break
            tmp.write(chunk)
        tmp_path = tmp.name

    try:
        result = await pipeline.process_audio(
            audio_file_path=tmp_path,
            asr_language=clean_asr_lang,
            target_lang=clean_target_lang,
            return_audio=return_audio,
            speaker_id=speaker_id,
        )
    finally:
        # Always clean up the temp audio file
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)

    return PipelineResponse(**result)


# ──────────────────────────────────────────────────────────────────────────────
@router.post(
    "/translate-only",
    summary="NLP normalize + translate only (no TTS synthesis)",
    description=(
        "Lightweight endpoint for text-to-text translation without TTS synthesis. "
        "Ideal for chat/text UI integrations."
    ),
)
async def translate_only(
    payload: PipelineTextRequest,
    pipeline=Depends(_get_pipeline),
):
    result = await pipeline.translate_only(
        text=payload.text,
        source_lang=payload.source_lang,
        target_lang=payload.target_lang,
    )
    return result
