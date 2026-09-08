#!/usr/bin/env python3
"""Phase 4 — /api/v1/tts endpoint."""

import asyncio
from fastapi import APIRouter, Depends, HTTPException, Request
from app.schemas.pipeline import TTSRequest, TTSResponse

router = APIRouter()

def _get_tts(request: Request):
    svc = getattr(request.app.state, "tts_service", None)
    if svc is None:
        raise HTTPException(status_code=503, detail="TTS service not loaded.")
    return svc

@router.post(
    "/synthesize",
    response_model=TTSResponse,
    summary="Offline speech synthesis via VITS / MMS-TTS",
    description=(
        "Synthesizes input text to speech using the locally loaded VITS model. "
        "Returns Base64-encoded WAV audio at the model's native sample rate."
    ),
)
async def synthesize_speech(
    payload: TTSRequest,
    tts=Depends(_get_tts),
):
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        None,
        lambda: tts.synthesize(payload.text, speaker_id=payload.speaker_id)
    )
    return TTSResponse(
        audio_base64=result["audio_base64"],
        sample_rate=result["sample_rate"],
        duration_seconds=result["duration_seconds"],
        inference_time_ms=result["inference_time_ms"],
    )
