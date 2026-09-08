#!/usr/bin/env python3
"""Phase 4 — /api/v1/asr endpoint (updated with app.state injection)."""

import os, tempfile
from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile
from app.schemas.pipeline import ASRResponse

router = APIRouter()

SUPPORTED = {".wav", ".mp3", ".flac", ".ogg", ".m4a", ".opus"}


def _get_asr(request: Request):
    svc = getattr(request.app.state, "asr_service", None)
    if svc is None:
        raise HTTPException(status_code=503, detail="ASR service not loaded.")
    return svc


@router.post(
    "/transcribe",
    response_model=ASRResponse,
    summary="Transcribe audio offline via faster-whisper (CTranslate2)",
    description=(
        "Uploads an audio file and transcribes it using the locally loaded Whisper model. "
        "Returns full transcription, detected language, confidence, and word-level timestamps."
    ),
)
async def transcribe_audio(
    file: UploadFile = File(..., description="Audio file to transcribe"),
    language: Optional[str] = Form(default=None, description="ISO 639-1 language hint"),
    word_timestamps: bool = Form(default=True),
    asr=Depends(_get_asr),
):
    suffix = os.path.splitext(file.filename or "audio.wav")[1].lower()
    if suffix not in SUPPORTED:
        raise HTTPException(400, detail=f"Unsupported audio format '{suffix}'.")

    clean_language = language.strip() if (language and language.strip()) else None
    if clean_language in ("auto", "none", "null", ""):
        clean_language = None

    audio_bytes = await file.read()
    result = await asyncio.get_event_loop().run_in_executor(
        None,
        lambda: asr.transcribe_bytes(audio_bytes, suffix=suffix, language=clean_language, word_timestamps=word_timestamps)
    )
    return ASRResponse(**result)

import asyncio
from typing import Optional
