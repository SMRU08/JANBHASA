#!/usr/bin/env python3
"""Phase 4 — /api/v1/translation endpoint."""

import asyncio
from fastapi import APIRouter, Depends, HTTPException, Request
from app.schemas.pipeline import TranslationRequest, TranslationResponse

router = APIRouter()

def _get_translation(request: Request):
    svc = getattr(request.app.state, "translation_service", None)
    if svc is None:
        raise HTTPException(status_code=503, detail="Translation service not loaded.")
    return svc

@router.post(
    "/translate",
    response_model=TranslationResponse,
    summary="Offline translation via AI4Bharat IndicTrans2",
    description=(
        "Translates text between 22+ Indian languages using the local IndicTrans2 checkpoint. "
        "Supports sat_Olck (Santhali Ol Chiki), hin_Deva, eng_Latn, and all major Indic scripts."
    ),
)
async def translate_text(
    payload: TranslationRequest,
    translation=Depends(_get_translation),
):
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        None,
        lambda: translation.translate(payload.text, payload.source_lang, payload.target_lang)
    )
    return TranslationResponse(**result)
