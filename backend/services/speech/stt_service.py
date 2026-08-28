"""
Whisper Speech-to-Text Service
Offline transcription supporting Hindi and Indian languages.
"""
import asyncio
import logging
from typing import Any, Optional

logger = logging.getLogger("janbhasha.stt")

WHISPER_LANG_MAP = {
    "hi": "hi", "en": "en", "or": "or",
    "sat": "hi",   # Santali → use Hindi model (best available offline)
    "ho": "hi",    # Ho → Hindi
    "mun": "hi",   # Mundari → Hindi
}


class STTService:
    def __init__(self, model_manager):
        self.manager = model_manager

    async def transcribe(self, audio_path: str, language: str = "hi") -> dict:
        """Transcribe audio file to text using Whisper."""
        model = self.manager.get_whisper()
        if model is None:
            return {
                "text": "",
                "language": language,
                "success": False,
                "error": "Speech recognition model is not installed. Please install Whisper: pip install openai-whisper"
            }

        whisper_lang = WHISPER_LANG_MAP.get(language, "hi")

        try:
            # Run blocking Whisper inference in thread pool
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None,
                lambda: model.transcribe(
                    audio_path,
                    language=whisper_lang,
                    task="transcribe",
                    fp16=False,  # Safer on CPU
                    verbose=False,
                )
            )
            return {
                "text": result["text"].strip(),
                "language": language,
                "detected_language": result.get("language", whisper_lang),
                "duration": result.get("duration", 0),
                "success": True,
            }
        except Exception as e:
            logger.error(f"Whisper transcription error: {e}")
            return {
                "text": "",
                "language": language,
                "success": False,
                "error": "Transcription failed. Please try again with clearer audio."
            }

    def get_status(self) -> dict:
        model = self.manager.get_whisper()
        status = self.manager.status["whisper"]
        return {
            "available": model is not None,
            "model_size": status.get("model_size"),
            "error": status.get("error"),
            "supported_languages": list(WHISPER_LANG_MAP.keys())
        }
