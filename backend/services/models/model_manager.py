"""
AI Model Manager - manages loading, fallback, and status of all offline AI models.
Supports Whisper, IndicTrans2, Tesseract OCR, and TTS.
"""
import os
import logging
from pathlib import Path
from typing import Optional, Any

logger = logging.getLogger("janbhasha.models")

AI_MODELS_PATH = Path(os.getenv("AI_MODELS_PATH", str(Path(__file__).parent.parent.parent.parent / "ai_models")))


class ModelManager:
    def __init__(self):
        self._whisper_model: Optional[Any] = None
        self._whisper_model_size: str = os.getenv("WHISPER_MODEL", "tiny")
        self._indictrans_model: Optional[Any] = None
        self._tts_engine: str = "none"
        self._tesseract_available: bool = False

        self.status = {
            "whisper": {"loaded": False, "model_size": None, "error": None},
            "indictrans2": {"loaded": False, "model": None, "error": None},
            "tesseract": {"loaded": False, "error": None},
            "tts": {"loaded": False, "engine": None, "error": None},
        }

    async def load_available_models(self):
        """Try to load each AI model. Failures are handled gracefully."""
        await self._load_whisper()
        await self._load_tesseract()
        await self._load_tts()
        # IndicTrans2 is loaded lazily on first translate call (large model)

    async def _load_whisper(self):
        try:
            import whisper
            model_size = self._whisper_model_size
            logger.info(f"Loading Whisper {model_size} model...")
            self._whisper_model = whisper.load_model(model_size)
            self.status["whisper"] = {"loaded": True, "model_size": model_size, "error": None}
            logger.info(f"✅ Whisper {model_size} loaded")
        except ImportError:
            msg = "openai-whisper not installed. Run: pip install openai-whisper"
            logger.warning(f"⚠️ Whisper: {msg}")
            self.status["whisper"]["error"] = msg
        except Exception as e:
            logger.warning(f"⚠️ Whisper load failed: {e}")
            self.status["whisper"]["error"] = str(e)
            # Try tiny as fallback
            if self._whisper_model_size != "tiny":
                logger.info("Retrying with Whisper tiny...")
                self._whisper_model_size = "tiny"
                await self._load_whisper()

    async def _load_tesseract(self):
        try:
            import pytesseract
            pytesseract.get_tesseract_version()
            self._tesseract_available = True
            self.status["tesseract"] = {"loaded": True, "error": None}
            logger.info("✅ Tesseract OCR available")
        except Exception as e:
            msg = "Tesseract not found. Install: sudo apt install tesseract-ocr tesseract-ocr-hin"
            logger.warning(f"⚠️ Tesseract: {msg}")
            self.status["tesseract"]["error"] = msg

    async def _load_tts(self):
        # Try espeak-ng first (best offline support)
        try:
            import subprocess
            result = subprocess.run(["espeak-ng", "--version"], capture_output=True, timeout=3)
            if result.returncode == 0:
                self._tts_engine = "espeak"
                self.status["tts"] = {"loaded": True, "engine": "espeak-ng", "error": None}
                logger.info("✅ espeak-ng TTS available")
                return
        except Exception:
            pass

        # Fallback: gTTS (needs internet but graceful)
        try:
            import gtts
            self._tts_engine = "gtts"
            self.status["tts"] = {"loaded": True, "engine": "gTTS (requires internet)", "error": None}
            logger.info("⚠️ Using gTTS (requires internet). Install espeak-ng for offline TTS.")
        except ImportError:
            msg = "No TTS engine available. Install espeak-ng or pip install gTTS"
            logger.warning(f"⚠️ TTS: {msg}")
            self.status["tts"]["error"] = msg

    def get_whisper(self):
        return self._whisper_model

    def get_tts_engine(self) -> str:
        return self._tts_engine

    def is_tesseract_available(self) -> bool:
        return self._tesseract_available

    def get_status_summary(self) -> dict:
        return {k: v["loaded"] for k, v in self.status.items()}

    def get_full_status(self) -> dict:
        return {
            "models": self.status,
            "paths": {
                "ai_models": str(AI_MODELS_PATH),
                "whisper": str(AI_MODELS_PATH / "whisper"),
                "indictrans2": str(AI_MODELS_PATH / "indictrans2"),
                "tts": str(AI_MODELS_PATH / "tts"),
                "ocr": str(AI_MODELS_PATH / "ocr"),
            }
        }
