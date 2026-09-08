#!/usr/bin/env python3
"""
Janbhasha Offline ASR Service — Phase 3
Engine: faster-whisper (CTranslate2 backend)

Strict offline-only execution:
  - Model weights are loaded exclusively from local paths (models/asr/).
  - No internet access is allowed or triggered.
  - TRANSFORMERS_OFFLINE=1 and HF_DATASETS_OFFLINE=1 are enforced at import time.

Inference Optimizations:
  - compute_type="int8" on CPU  (4x memory reduction vs float32)
  - compute_type="float16" on CUDA (2x speedup vs float32)
  - VAD filter enabled to skip silent audio segments
  - Beam search with word-level timestamps
"""

import os
import sys
import time
import wave
import tempfile
import shutil
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union

# ── Enforce offline mode before any HuggingFace / network-aware imports ──────
os.environ["TRANSFORMERS_OFFLINE"] = "1"
os.environ["HF_DATASETS_OFFLINE"] = "1"
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["NO_PROXY"] = "*"

from loguru import logger

# ── Project root resolution ───────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent.parent   # → JANBHASHA/

# ── Constants ─────────────────────────────────────────────────────────────────
SUPPORTED_AUDIO_EXTS = {".wav", ".mp3", ".flac", ".ogg", ".m4a", ".opus"}
WHISPER_VALID_COMPUTE_CPU = ("int8", "int8_float32", "int8_float16", "float32")
WHISPER_VALID_COMPUTE_GPU = ("float16", "int8_float16", "float32")

# ──────────────────────────────────────────────────────────────────────────────
class JanbhashaASRService:
    """
    Offline Automatic Speech Recognition via faster-whisper (CTranslate2).

    Behaviour:
    - On first call to load_model(), weights are verified to exist at
      `model_path` BEFORE attempting to initialise faster-whisper, which
      prevents any silent network fallback.
    - CUDA is used when available; falls back to CPU automatically.
    - compute_type is chosen based on device capability.
    - Lazy loading: the model is not loaded until the first inference call
      or until load_model() is called explicitly.
    """

    def __init__(
        self,
        model_path: Optional[str] = None,
        fallback_model_size: str = "base",
        device: Optional[str] = None,
        compute_type: Optional[str] = None,
        beam_size: int = 5,
        vad_filter: bool = True,
        language: Optional[str] = None,
    ):
        self.model_path = str(BASE_DIR / (model_path or "models/asr/whisper-small-indic"))
        self.fallback_model_size = fallback_model_size
        self.beam_size = beam_size
        self.vad_filter = vad_filter
        self.language = language if language and language != "auto" else None
        self._model = None
        self._model_loaded = False

        # ── Device detection with explicit fallback ───────────────────────
        self.device, self.compute_type = self._resolve_device_and_dtype(device, compute_type)
        logger.info(
            f"[ASR] Initialized | device={self.device} "
            f"compute_type={self.compute_type} | model={self.model_path}"
        )

    # ──────────────────────────────────────────────────────────────────────
    @staticmethod
    def _resolve_device_and_dtype(
        requested_device: Optional[str],
        requested_compute: Optional[str]
    ) -> Tuple[str, str]:
        """Auto-detects the best device and selects optimal compute_type."""
        try:
            import torch
            cuda_available = torch.cuda.is_available()
        except ImportError:
            cuda_available = False

        if requested_device == "cuda" and not cuda_available:
            logger.warning("[ASR] CUDA requested but unavailable. Falling back to CPU.")
            requested_device = "cpu"

        device = requested_device or ("cuda" if cuda_available else "cpu")

        if device == "cuda":
            compute_type = requested_compute if requested_compute in WHISPER_VALID_COMPUTE_GPU else "float16"
        else:
            compute_type = requested_compute if requested_compute in WHISPER_VALID_COMPUTE_CPU else "int8"

        return device, compute_type

    # ──────────────────────────────────────────────────────────────────────
    def _verify_model_path(self) -> str:
        """
        Verifies the local model checkpoint exists.
        Raises FileNotFoundError if absent — never falls back to internet.
        Returns the resolved model path (directory or single .bin/.ct2 file).
        """
        p = Path(self.model_path)
        if p.exists():
            # Validate it's a proper CTranslate2 directory
            if p.is_dir():
                required = {"model.bin", "config.json", "vocabulary.json"}
                found = {f.name for f in p.iterdir()}
                missing = required - found
                if missing:
                    logger.warning(
                        f"[ASR] Model directory missing files: {missing}. "
                        f"Weights may be incomplete or in HF format."
                    )
            return str(p)

        raise FileNotFoundError(
            f"[ASR] OFFLINE ENFORCEMENT: Local model not found at '{self.model_path}'.\n"
            f"  → Download weights offline and place them in: {self.model_path}\n"
            f"  → Conversion command (run once with internet):\n"
            f"    ct2-opus-mt-convert --model openai/whisper-small --output_dir {self.model_path} "
            f"--quantization {self.compute_type}\n"
            f"  → Or use faster-whisper download script with TRANSFORMERS_OFFLINE=0."
        )

    # ──────────────────────────────────────────────────────────────────────
    def load_model(self) -> None:
        """
        Loads the faster-whisper model from local path into memory.
        Called once at server startup (lifespan) or lazily on first inference.
        """
        if self._model_loaded:
            logger.debug("[ASR] Model already loaded, skipping reload.")
            return

        try:
            from faster_whisper import WhisperModel
        except ImportError as e:
            raise ImportError(
                "[ASR] faster-whisper is not installed. Run: pip install faster-whisper"
            ) from e

        model_source = self._verify_model_path()
        logger.info(f"[ASR] Loading model from '{model_source}' on {self.device} [{self.compute_type}]...")

        t0 = time.perf_counter()
        try:
            self._model = WhisperModel(
                model_size_or_path=model_source,
                device=self.device,
                compute_type=self.compute_type,
                download_root=None,         # Disables any download behaviour
                local_files_only=True,      # Hard blocks network access
            )
        except Exception as exc:
            raise RuntimeError(
                f"[ASR] Failed to load offline Whisper model from '{model_source}': {exc}"
            ) from exc

        elapsed = time.perf_counter() - t0
        self._model_loaded = True
        logger.success(f"[ASR] Model loaded in {elapsed:.2f}s ✓")

    # ──────────────────────────────────────────────────────────────────────
    def _ensure_loaded(self) -> None:
        """Lazy loader: initialises model on first inference call."""
        if not self._model_loaded:
            self.load_model()

    # ──────────────────────────────────────────────────────────────────────
    @staticmethod
    def _validate_audio_file(path: str) -> Path:
        """Validates audio file extension and existence."""
        p = Path(path)
        if p.suffix.lower() not in SUPPORTED_AUDIO_EXTS:
            raise ValueError(
                f"[ASR] Unsupported audio format '{p.suffix}'. "
                f"Supported: {SUPPORTED_AUDIO_EXTS}"
            )
        if not p.exists():
            raise FileNotFoundError(f"[ASR] Audio file not found: '{path}'")
        return p

    # ──────────────────────────────────────────────────────────────────────
    @staticmethod
    def _get_audio_duration(file_path: Path) -> Optional[float]:
        """Attempts to read WAV duration using stdlib; returns None for other formats."""
        if file_path.suffix.lower() == ".wav":
            try:
                with wave.open(str(file_path), "rb") as wf:
                    return wf.getnframes() / float(wf.getframerate())
            except Exception:
                pass
        return None

    # ──────────────────────────────────────────────────────────────────────
    def transcribe(
        self,
        audio_file_path: str,
        language: Optional[str] = None,
        task: str = "transcribe",
        word_timestamps: bool = True,
        initial_prompt: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Transcribes a local audio file into text using offline Whisper.

        Args:
            audio_file_path: Absolute or relative path to local audio file.
            language: ISO 639-1/3 language code (e.g. "hi", "sat", "en").
                      If None, auto-detected by Whisper.
            task: "transcribe" (keep language) or "translate" (force to English).
            word_timestamps: Return word-level timing if True.
            initial_prompt: Optional decoder prompt for domain priming.

        Returns:
            dict with keys:
              - transcription: str
              - detected_language: str
              - language_probability: float (0–1)
              - duration_seconds: float
              - segments: list of {start, end, text, words}
              - inference_time_ms: float
        """
        self._ensure_loaded()
        audio_path = self._validate_audio_file(audio_file_path)

        if language in ("", "auto", "none", "null"):
            language = None
        effective_language = language or self.language
        if effective_language in ("", "auto", "none", "null"):
            effective_language = None

        logger.info(f"[ASR] Transcribing: {audio_path.name} | lang={effective_language or 'auto'}")
        t0 = time.perf_counter()

        try:
            segments_raw, info = self._model.transcribe(
                audio=str(audio_path),
                language=effective_language,
                task=task,
                beam_size=self.beam_size,
                word_timestamps=word_timestamps,
                vad_filter=self.vad_filter,
                vad_parameters={"min_silence_duration_ms": 500},
                initial_prompt=initial_prompt,
                condition_on_previous_text=True,
                without_timestamps=False,
            )
        except Exception as exc:
            raise RuntimeError(f"[ASR] Transcription failed for '{audio_path}': {exc}") from exc

        # Materialise the generator into structured segments
        segments: List[Dict[str, Any]] = []
        full_text_parts: List[str] = []

        for seg in segments_raw:
            word_list = []
            if word_timestamps and seg.words:
                word_list = [
                    {"word": w.word, "start": round(w.start, 3), "end": round(w.end, 3), "probability": round(w.probability, 4)}
                    for w in seg.words
                ]
            seg_dict = {
                "id": seg.id,
                "start": round(seg.start, 3),
                "end": round(seg.end, 3),
                "text": seg.text.strip(),
                "avg_logprob": round(seg.avg_logprob, 4),
                "no_speech_prob": round(seg.no_speech_prob, 4),
                "words": word_list,
            }
            segments.append(seg_dict)
            full_text_parts.append(seg.text.strip())

        full_text = " ".join(full_text_parts).strip()
        duration = self._get_audio_duration(audio_path) or getattr(info, "duration", None)
        inference_ms = round((time.perf_counter() - t0) * 1000, 2)

        logger.success(
            f"[ASR] Done in {inference_ms}ms | lang={info.language} "
            f"({info.language_probability:.2%}) | segments={len(segments)}"
        )

        return {
            "transcription": full_text,
            "detected_language": info.language,
            "language_probability": round(info.language_probability, 4),
            "duration_seconds": round(duration, 3) if duration else None,
            "segments": segments,
            "inference_time_ms": inference_ms,
        }

    # ──────────────────────────────────────────────────────────────────────
    def transcribe_bytes(self, audio_bytes: bytes, suffix: str = ".wav", **kwargs) -> Dict[str, Any]:
        """
        Convenience wrapper: accepts raw audio bytes, writes to a temp file,
        transcribes, and cleans up. Useful for FastAPI UploadFile payloads.
        """
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name
        try:
            return self.transcribe(tmp_path, **kwargs)
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    # ──────────────────────────────────────────────────────────────────────
    def unload_model(self) -> None:
        """Releases model from memory. Useful for memory-constrained deployments."""
        if self._model is not None:
            del self._model
            self._model = None
            self._model_loaded = False
            logger.info("[ASR] Model unloaded from memory.")

    # ──────────────────────────────────────────────────────────────────────
    def health_check(self) -> Dict[str, Any]:
        """Returns service readiness and hardware status."""
        try:
            import torch
            cuda_info = {
                "cuda_available": torch.cuda.is_available(),
                "cuda_device": torch.cuda.get_device_name(0) if torch.cuda.is_available() else None,
            }
        except ImportError:
            cuda_info = {"cuda_available": False, "cuda_device": None}

        return {
            "service": "ASR (faster-whisper)",
            "model_loaded": self._model_loaded,
            "model_path": self.model_path,
            "device": self.device,
            "compute_type": self.compute_type,
            **cuda_info,
        }


# ── Singleton for FastAPI dependency injection ─────────────────────────────────
asr_service = JanbhashaASRService()
