"""Speech-to-Text API - Offline transcription via Whisper"""
import os, tempfile, logging
from fastapi import APIRouter, UploadFile, File, Request
from models.response import ok, error
from services.speech.stt_service import STTService
from typing import Optional

logger = logging.getLogger("janbhasha.stt")
router = APIRouter()
_service: Optional[STTService] = None


def get_service(request: Request) -> STTService:
    global _service
    if _service is None:
        _service = STTService(request.app.state.model_manager)
    return _service


@router.post("/transcribe")
async def transcribe_audio(
    request: Request,
    audio: UploadFile = File(...),
    language: str = "hi"
):
    """Transcribe audio file to text using offline Whisper model."""
    allowed = {"audio/wav", "audio/mp3", "audio/mpeg", "audio/ogg", "audio/webm", "audio/m4a"}
    if audio.content_type and audio.content_type not in allowed:
        return error(f"Unsupported audio format: {audio.content_type}", "INVALID_FORMAT")

    try:
        content = await audio.read()
        if len(content) == 0:
            return error("Audio file is empty.", "EMPTY_AUDIO")

        suffix = os.path.splitext(audio.filename or "audio.wav")[1] or ".wav"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(content)
            tmp_path = tmp.name

        svc = get_service(request)
        result = await svc.transcribe(tmp_path, language)

        os.unlink(tmp_path)
        return ok(result)

    except Exception as e:
        logger.error(f"STT transcription error: {e}")
        return error("Transcription failed. Please check your audio and try again.", "STT_FAILED")


@router.get("/status")
async def stt_status(request: Request):
    """Check STT model availability."""
    svc = get_service(request)
    return ok(svc.get_status())
