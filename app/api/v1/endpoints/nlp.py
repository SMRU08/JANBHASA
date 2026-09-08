#!/usr/bin/env python3
"""Phase 4 — /api/v1/nlp endpoint."""

from fastapi import APIRouter
from app.schemas.pipeline import NLPProcessRequest, NLPProcessResponse
from app.services.nlp_service import nlp_service

router = APIRouter()

@router.post(
    "/process",
    response_model=NLPProcessResponse,
    summary="Bilingual NLP analysis and Bharatavani normalization",
    description=(
        "Detects script composition, identifies code-mixing points (Ol Chiki / Devanagari / Latin), "
        "applies Bharatavani lexicon normalization, and prepares text for IndicTrans2."
    ),
)
async def process_nlp(payload: NLPProcessRequest):
    result = nlp_service.analyze_and_clean(payload.text, target_lang=payload.target_script)
    return NLPProcessResponse(**result)
