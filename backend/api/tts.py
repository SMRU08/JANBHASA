"""Text-to-Speech API - Offline speech synthesis"""
import logging
from fastapi import APIRouter, Request
from fastapi.responses import FileResponse
from pydantic import BaseModel
from models.response import ok, error
from services.tts.tts_service import TTSService
from typing import Optional

logger = logging.getLogger("janbhasha.tts")
router = APIRouter()
_service: Optional[TTSService] = None


def get_service(request: Request) -> TTSService:
    global _service
    if _service is None:
        _service = TTSService(request.app.state.model_manager)
    return _service


class SynthesizeRequest(BaseModel):
    text: str
    language: str = "hi"
    use_cache: bool = True


@router.post("/synthesize")
async def synthesize(req: SynthesizeRequest, request: Request):
    """Synthesize text to speech. Returns audio file path or base64."""
    if not req.text.strip():
        return error("Text cannot be empty.", "EMPTY_TEXT")
    if len(req.text) > 2000:
        return error("Text is too long. Max 2000 characters.", "TEXT_TOO_LONG")

    svc = get_service(request)
    result = await svc.synthesize(req.text, req.language, req.use_cache)
    return ok(result)


@router.get("/audio/{filename}")
async def get_audio(filename: str, request: Request):
    """Stream generated audio file."""
    svc = get_service(request)
    path = svc.get_audio_path(filename)
    if not path or not path.exists():
        from fastapi import HTTPException
        raise HTTPException(404, "Audio file not found")
    return FileResponse(str(path), media_type="audio/wav")


@router.get("/status")
async def tts_status(request: Request):
    svc = get_service(request)
    return ok(svc.get_status())
