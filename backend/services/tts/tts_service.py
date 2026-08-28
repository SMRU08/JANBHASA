"""
TTS Service - Offline Text-to-Speech
Primary: espeak-ng (fully offline, all languages)
Fallback: gTTS (requires internet)
"""
import asyncio
import hashlib
import logging
import os
import tempfile
from pathlib import Path
from typing import Optional

logger = logging.getLogger("janbhasha.tts")

CACHE_DIR = Path(tempfile.gettempdir()) / "janbhasha_tts_cache"
CACHE_DIR.mkdir(exist_ok=True)

# espeak-ng voice codes for Indian languages
ESPEAK_VOICES = {
    "hi": "hi",       # Hindi
    "en": "en-in",    # Indian English
    "or": "or",       # Odia (if available, else hi)
    "sat": "hi",      # Santali - use Hindi voice
    "ho": "hi",       # Ho - use Hindi voice
    "mun": "hi",      # Mundari - use Hindi voice
    "bn": "bn",       # Bengali
}

# gTTS language codes
GTTS_LANGS = {
    "hi": "hi", "en": "en", "or": "or",
    "sat": "hi", "ho": "hi", "mun": "hi",
}


class TTSService:
    def __init__(self, model_manager):
        self.manager = model_manager

    async def synthesize(self, text: str, language: str = "hi", use_cache: bool = True) -> dict:
        """Convert text to speech audio. Returns path to audio file."""
        # Generate cache key
        cache_key = hashlib.md5(f"{text}_{language}".encode()).hexdigest()
        cache_path = CACHE_DIR / f"{cache_key}.wav"

        if use_cache and cache_path.exists():
            return {
                "success": True,
                "audio_path": str(cache_path),
                "audio_url": f"/api/tts/audio/{cache_key}.wav",
                "method": "cache",
                "language": language,
            }

        engine = self.manager.get_tts_engine()

        if engine == "espeak":
            result = await self._espeak_synthesize(text, language, cache_path)
        elif engine == "gtts":
            result = await self._gtts_synthesize(text, language, cache_path)
        else:
            return {
                "success": False,
                "error": "No TTS engine available. Please install espeak-ng: sudo apt install espeak-ng",
                "text": text,
                "language": language,
            }

        if result:
            return {
                "success": True,
                "audio_path": str(cache_path),
                "audio_url": f"/api/tts/audio/{cache_key}.wav",
                "method": engine,
                "language": language,
            }
        return {"success": False, "error": "TTS synthesis failed.", "text": text}

    async def _espeak_synthesize(self, text: str, language: str, output_path: Path) -> bool:
        voice = ESPEAK_VOICES.get(language, "hi")
        cmd = ["espeak-ng", "-v", voice, "-w", str(output_path), "--speed=130", text]
        try:
            loop = asyncio.get_event_loop()
            proc = await loop.run_in_executor(
                None,
                lambda: __import__("subprocess").run(cmd, capture_output=True, timeout=30)
            )
            return proc.returncode == 0 and output_path.exists()
        except Exception as e:
            logger.error(f"espeak-ng error: {e}")
            return False

    async def _gtts_synthesize(self, text: str, language: str, output_path: Path) -> bool:
        try:
            from gtts import gTTS
            lang = GTTS_LANGS.get(language, "hi")
            mp3_path = output_path.with_suffix(".mp3")
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None, lambda: gTTS(text=text, lang=lang, slow=False).save(str(mp3_path))
            )
            # Convert mp3 to wav using available tool
            if mp3_path.exists():
                try:
                    import subprocess
                    subprocess.run(["ffmpeg", "-y", "-i", str(mp3_path), str(output_path)],
                                   capture_output=True, timeout=10)
                    mp3_path.unlink(missing_ok=True)
                    return output_path.exists()
                except Exception:
                    # Return mp3 path if ffmpeg not available
                    output_path.write_bytes(mp3_path.read_bytes())
                    return True
        except Exception as e:
            logger.error(f"gTTS error: {e}")
            return False

    def get_audio_path(self, filename: str) -> Optional[Path]:
        path = CACHE_DIR / filename
        return path if path.exists() else None

    def get_status(self) -> dict:
        status = self.manager.status["tts"]
        return {
            "available": status["loaded"],
            "engine": status.get("engine"),
            "error": status.get("error"),
            "supported_languages": list(ESPEAK_VOICES.keys()),
        }
