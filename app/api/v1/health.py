#!/usr/bin/env python3
"""Phase 4 — Granular health check endpoint returning per-service status."""

from fastapi import APIRouter, Request
from app.schemas.pipeline import SystemHealthResponse, OfflineServiceStatus
from app.core.config import settings

router = APIRouter()

@router.get(
    "/",
    response_model=SystemHealthResponse,
    summary="Full system health check with per-service AI model status",
    description="Returns loaded/unloaded state for Whisper, IndicTrans2, and VITS.",
)
async def health_check(request: Request):
    asr_svc   = getattr(request.app.state, "asr_service",         None)
    trans_svc = getattr(request.app.state, "translation_service", None)
    tts_svc   = getattr(request.app.state, "tts_service",         None)

    def _status(svc, name: str) -> OfflineServiceStatus:
        if svc is None:
            return OfflineServiceStatus(
                service=name, model_loaded=False, model_path="N/A",
                device="N/A", cuda_available=False
            )
        hc = svc.health_check()
        return OfflineServiceStatus(**{
            "service": hc.get("service", name),
            "model_loaded": hc.get("model_loaded", False),
            "model_path": hc.get("model_path", "N/A"),
            "device": hc.get("device", "cpu"),
            "cuda_available": hc.get("cuda_available", False),
            "cuda_device": hc.get("cuda_device"),
        })

    services = {
        "asr":         _status(asr_svc,   "ASR (faster-whisper)"),
        "translation": _status(trans_svc, "Translation (IndicTrans2)"),
        "tts":         _status(tts_svc,   "TTS (VITS / MMS-TTS)"),
    }

    all_loaded = all(s.model_loaded for s in services.values())

    return SystemHealthResponse(
        status="healthy" if all_loaded else "degraded",
        app_name=settings.app_name,
        version=settings.version,
        offline_ready=all_loaded,
        services=services,
    )
