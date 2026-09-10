#!/usr/bin/env python3
"""
Janbhasha Offline TTS Service — Phase 3
Engine: VITS (Variational Inference with adversarial learning for end-to-end TTS)
Implementation: HuggingFace transformers VitsModel + VitsTokenizer

Strict offline-only execution:
  - Model + tokenizer loaded exclusively from models/tts/ — no HF Hub calls.
  - TRANSFORMERS_OFFLINE=1 is enforced before any import.

Architecture (VITS):
  Text → Phonemizer → VitsTokenizer → Text Encoder
                                           │
                                     Stochastic Duration Predictor
                                     Posterior Encoder (VAE)
                                     Normalizing Flow
                                           │ latent z
                                     HiFi-GAN Decoder
                                           │
                                     Raw waveform (numpy float32)

Output:
  - numpy array at model sample_rate (typically 16000 Hz for MMS-TTS
    or 22050 Hz for VITS-SAT fine-tunes)
  - Optionally written to WAV file via scipy/soundfile
"""

import io
import os
import sys
import time
import base64
import struct
import wave
from pathlib import Path
from typing import Any, Dict, Optional, Tuple, Union

# ── Enforce offline mode before any HF imports ────────────────────────────────
os.environ["TRANSFORMERS_OFFLINE"] = "1"
os.environ["HF_DATASETS_OFFLINE"] = "1"
os.environ["HF_HUB_OFFLINE"] = "1"

from loguru import logger

BASE_DIR = Path(__file__).resolve().parent.parent.parent   # → JANBHASHA/

# ──────────────────────────────────────────────────────────────────────────────
class JanbhashaTTSService:
    """
    Offline Text-to-Speech synthesis using VITS (HuggingFace transformers).

    The HuggingFace VITS API provides:
      VitsModel   — end-to-end acoustic decoder (encoder + flow + HiFi-GAN vocoder)
      VitsTokenizer — handles phonemisation and input encoding

    Primary offline model: facebook/mms-tts-sat (Santhali MMS-TTS)
    or any locally fine-tuned VITS checkpoint stored in models/tts/.

    Lazy loading: model is not initialised until the first synthesis call
    (or explicit load_model() call at startup).
    """

    def __init__(
        self,
        model_path: Optional[str] = None,
        device: Optional[str] = None,
        speaking_rate: float = 1.0,
        noise_scale: float = 0.667,
        noise_scale_duration: float = 0.8,
    ):
        self.model_path = str(BASE_DIR / (model_path or "models/tts/vits-santhali"))
        self.speaking_rate = speaking_rate
        self.noise_scale = noise_scale
        self.noise_scale_duration = noise_scale_duration

        self._model = None
        self._tokenizer = None
        self._model_loaded = False
        self._sample_rate: int = 22050  # Updated after model load from config

        self.device = self._resolve_device(device)
        logger.info(
            f"[TTS] Initialized | device={self.device} | model={self.model_path}"
        )

    # ──────────────────────────────────────────────────────────────────────
    @staticmethod
    def _resolve_device(requested: Optional[str]) -> str:
        """Returns 'cuda' if available and requested, otherwise 'cpu'."""
        try:
            import torch
            cuda_ok = torch.cuda.is_available()
        except ImportError:
            cuda_ok = False

        if requested == "cuda" and not cuda_ok:
            logger.warning("[TTS] CUDA requested but unavailable. Falling back to CPU.")
            return "cpu"
        return requested or ("cuda" if cuda_ok else "cpu")

    # ──────────────────────────────────────────────────────────────────────
    def _verify_model_path(self) -> None:
        """
        Validates the local VITS checkpoint before loading.
        Expected files: config.json, tokenizer_config.json, model weights.
        """
        p = Path(self.model_path)

        if not p.exists() or not p.is_dir():
            for fallback in ["vits-hindi-mms", "vits-ho-mms", "vits-mundari-mms"]:
                fb_path = BASE_DIR / "models" / "tts" / fallback
                if fb_path.exists() and fb_path.is_dir():
                    logger.warning(
                        f"[TTS] Configured model '{self.model_path}' not found. "
                        f"Falling back to available local model '{fb_path}'."
                    )
                    self.model_path = str(fb_path)
                    p = fb_path
                    break

        if not p.exists() or not p.is_dir():
            raise FileNotFoundError(
                f"[TTS] OFFLINE ENFORCEMENT: VITS model directory not found:\n"
                f"  '{self.model_path}'\n\n"
                f"Download Santhali MMS-TTS offline (run once with internet):\n"
                f"  from huggingface_hub import snapshot_download\n"
                f"  snapshot_download(\n"
                f"      'facebook/mms-tts-sat',\n"
                f"      local_dir='{self.model_path}',\n"
                f"      ignore_patterns=['*.msgpack','*.h5','flax_model*']\n"
                f"  )\n\n"
                f"For fine-tuned VITS checkpoints, place:\n"
                f"  config.json, tokenizer_config.json, model.safetensors (or pytorch_model.bin)\n"
                f"  inside: {self.model_path}"
            )

        required = ["config.json"]
        weight_candidates = [
            "model.safetensors", "pytorch_model.bin",
            "model.safetensors.index.json"
        ]

        missing = [f for f in required if not (p / f).exists()]
        if missing:
            raise FileNotFoundError(
                f"[TTS] Missing required file(s) {missing} in '{self.model_path}'"
            )

        if not any((p / w).exists() for w in weight_candidates):
            raise FileNotFoundError(
                f"[TTS] No weight file found in '{self.model_path}'. "
                f"Expected one of: {weight_candidates}"
            )

    # ──────────────────────────────────────────────────────────────────────
    def load_model(self) -> None:
        """
        Loads VITS model and tokenizer from local path.
        Reads sample_rate from model config after loading.
        """
        if self._model_loaded:
            logger.debug("[TTS] Model already loaded.")
            return

        self._verify_model_path()

        try:
            import torch
            from transformers import VitsModel, VitsTokenizer, AutoTokenizer
        except ImportError as e:
            raise ImportError(
                "[TTS] transformers >= 4.33 required for VitsModel: pip install transformers"
            ) from e

        logger.info(f"[TTS] Loading VITS tokenizer from '{self.model_path}'...")
        t0 = time.perf_counter()

        try:
            # VitsTokenizer includes the phonemiser and character/phoneme vocabulary
            self._tokenizer = VitsTokenizer.from_pretrained(
                self.model_path,
                local_files_only=True,   # ← Hard offline constraint
            )
        except Exception:
            # VitsTokenizer is available from transformers >= 4.36; try AutoTokenizer as fallback
            try:
                logger.warning("[TTS] VitsTokenizer not available, trying AutoTokenizer...")
                self._tokenizer = AutoTokenizer.from_pretrained(
                    self.model_path,
                    local_files_only=True,
                )
            except Exception as exc:
                raise RuntimeError(
                    f"[TTS] Tokenizer load failed from '{self.model_path}': {exc}"
                ) from exc

        logger.info(f"[TTS] Loading VITS acoustic model from '{self.model_path}'...")
        try:
            import torch
            self._model = VitsModel.from_pretrained(
                self.model_path,
                local_files_only=True,   # ← Hard offline constraint
                torch_dtype=torch.float32,   # VITS is sensitive to FP16; always use FP32
                ignore_mismatched_sizes=True,
            )
            self._model.eval()
            self._model.to(self.device)
        except Exception as exc:
            raise RuntimeError(
                f"[TTS] VITS model load failed from '{self.model_path}': {exc}"
            ) from exc

        # Read sample_rate from model config
        if hasattr(self._model.config, "sampling_rate"):
            self._sample_rate = self._model.config.sampling_rate
        elif hasattr(self._model.config, "sample_rate"):
            self._sample_rate = self._model.config.sample_rate

        elapsed = time.perf_counter() - t0
        self._model_loaded = True
        logger.success(
            f"[TTS] VITS loaded in {elapsed:.2f}s | sample_rate={self._sample_rate}Hz ✓"
        )

    # ──────────────────────────────────────────────────────────────────────
    def _ensure_loaded(self) -> None:
        if not self._model_loaded:
            self.load_model()

    # ──────────────────────────────────────────────────────────────────────
    @staticmethod
    def _numpy_to_wav_bytes(audio_array, sample_rate: int) -> bytes:
        """
        Converts a float32 numpy waveform to raw WAV bytes (16-bit PCM)
        using Python's stdlib wave module — no scipy or soundfile dependency.
        """
        import numpy as np
        # Clamp, scale, and convert to int16
        audio_clipped = np.clip(audio_array, -1.0, 1.0)
        audio_int16 = (audio_clipped * 32767).astype(np.int16)

        buffer = io.BytesIO()
        with wave.open(buffer, "wb") as wf:
            wf.setnchannels(1)        # Mono
            wf.setsampwidth(2)        # 16-bit
            wf.setframerate(sample_rate)
            wf.writeframes(audio_int16.tobytes())
        return buffer.getvalue()

    @classmethod
    def _waveform_to_base64_wav(cls, audio_array, sample_rate: int) -> str:
        """Helper to convert float32 numpy audio waveform to base64 WAV."""
        wav_bytes = cls._numpy_to_wav_bytes(audio_array, sample_rate)
        return base64.b64encode(wav_bytes).decode("utf-8")

    @staticmethod
    def _phonetic_olchiki_to_deva(text: str) -> str:
        """
        Phonetically transliterates Santali Ol Chiki Unicode script (U+1C50-U+1C7F)
        into Devanagari phonemes for acoustic synthesis by VITS models.
        Preserves original Santali pronunciation and allows models without Ol Chiki
        in vocab (e.g. vits-hindi-mms) to synthesize natural, accurate speech.
        """
        has_olchiki = any(0x1C50 <= ord(c) <= 0x1C7F for c in text)
        if not has_olchiki:
            return text

        consonants = {
            'ᱛ': 'त', 'ᱜ': 'ग', 'ᱝ': 'ङ', 'ᱞ': 'ल',
            'ᱠ': 'क', 'ᱡ': 'ज', 'ᱢ': 'म', 'ᱣ': 'व',
            'ᱥ': 'स', 'ᱦ': 'ह', 'ᱧ': 'ञ', 'ᱨ': 'र',
            'ᱪ': 'च', 'ᱫ': 'द', 'ᱬ': 'ण', 'ᱭ': 'य',
            'ᱯ': 'प', 'ᱰ': 'ड', 'ᱱ': 'न', 'ᱲ': 'ड़',
            'ᱴ': 'ट', 'ᱵ': 'ब', 'ᱷ': '्ह'
        }
        vowels_initial = {'ᱚ': 'अ', 'ᱟ': 'आ', 'ᱤ': 'इ', 'ᱩ': 'उ', 'ᱮ': 'ए', 'ᱳ': 'ओ'}
        vowels_matra = {'ᱚ': '', 'ᱟ': 'ा', 'ᱤ': 'ि', 'ᱩ': 'ु', 'ᱮ': 'े', 'ᱳ': 'ो'}
        modifiers = {'ᱶ': 'ँ', 'ᱸ': 'ं', 'ᱹ': '', 'ᱺ': '', 'ᱻ': '', 'ᱼ': '', 'ᱽ': ''}

        out = []
        prev_was_consonant = False
        for ch in text:
            if ch in consonants:
                out.append(consonants[ch])
                prev_was_consonant = True
            elif ch in vowels_matra:
                if prev_was_consonant:
                    out.append(vowels_matra[ch])
                else:
                    out.append(vowels_initial[ch])
                prev_was_consonant = False
            elif ch in modifiers:
                out.append(modifiers[ch])
                prev_was_consonant = False
            else:
                out.append(ch)
                prev_was_consonant = False
        return ''.join(out)

    # ──────────────────────────────────────────────────────────────────────
    def synthesize(
        self,
        text: str,
        speaker_id: Optional[int] = None,
        output_wav_path: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Synthesizes input text to speech waveform using offline VITS.

        Args:
            text: Target language text (e.g. Santhali in Ol Chiki or Latin script).
            speaker_id: Integer speaker ID for multi-speaker VITS checkpoints.
                        Set to None for single-speaker models.
            output_wav_path: If provided, waveform is saved to this local path.

        Returns:
            dict with:
              - audio_base64: Base64-encoded WAV bytes (for API transport)
              - audio_array: Raw numpy float32 waveform
              - sample_rate: int
              - duration_seconds: float
              - inference_time_ms: float
        """
        self._ensure_loaded()

        if not text or not text.strip():
            logger.warning("[TTS] Input text is empty. Returning clean silence fallback.")
            import numpy as np
            sample_rate = getattr(self, "_sample_rate", 16000)
            silent_samples = np.zeros(int(sample_rate * 0.1), dtype=np.float32)
            audio_b64 = self._waveform_to_base64_wav(silent_samples, sample_rate)
            return {
                "audio_base64": audio_b64,
                "audio_array": silent_samples,
                "sample_rate": sample_rate,
                "duration_seconds": 0.1,
                "inference_time_ms": 0.0,
            }

        text = text.strip()
        logger.info(f"[TTS] Synthesizing: '{text[:60]}...' | speaker={speaker_id}")

        import torch
        import numpy as np

        t0 = time.perf_counter()

        # Check if tokenizer vocabulary supports Ol Chiki directly
        vocab = getattr(self._tokenizer, "get_vocab", lambda: {})()
        model_has_olchiki = any(0x1C50 <= ord(k[0]) <= 0x1C7F for k in vocab.keys() if k)
        synth_text = text
        if not model_has_olchiki:
            synth_text = self._phonetic_olchiki_to_deva(text)
            if synth_text != text:
                logger.info(f"[TTS] Phonetically adapted Ol Chiki for VITS: '{synth_text[:60]}'")

        # ── Tokenise ─────────────────────────────────────────────────────
        try:
            tokenizer_kwargs: Dict[str, Any] = {
                "text": synth_text,
                "return_tensors": "pt",
            }
            # VITS tokenizer accepts speaking_rate via tokenizer call in newer transformers
            if hasattr(self._tokenizer, "speaking_rate"):
                tokenizer_kwargs["speaking_rate"] = self.speaking_rate

            inputs = self._tokenizer(**tokenizer_kwargs)
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
        except Exception as exc:
            raise RuntimeError(f"[TTS] Tokenisation failed: {exc}") from exc

        # Guard against empty/unsupported token sequences which crash VITS attention layers
        input_ids = inputs.get("input_ids")
        if input_ids is None or input_ids.shape[-1] <= 1:
            logger.warning(
                f"[TTS] Input text has unsupported characters for this TTS model "
                f"({input_ids.shape[-1] if input_ids is not None else 0} valid token(s)). "
                f"Returning clean silence fallback."
            )
            sample_rate = getattr(self, "_sample_rate", 16000)
            silent_samples = np.zeros(int(sample_rate * 0.5), dtype=np.float32)
            audio_b64 = self._waveform_to_base64_wav(silent_samples, sample_rate)
            return {
                "audio_base64": audio_b64,
                "sample_rate": sample_rate,
                "duration_seconds": 0.5,
                "inference_time_ms": round((time.perf_counter() - t0) * 1000, 2),
            }

        # ── Inference (VITS is deterministic in eval mode) ────────────────
        try:
            inference_kwargs: Dict[str, Any] = {
                "noise_scale": self.noise_scale,
                "noise_scale_duration": self.noise_scale_duration,
                "speaking_rate": self.speaking_rate,
            }
            if speaker_id is not None:
                # Only pass speaker_id if model actually has multi-speaker embeddings
                num_speakers = getattr(getattr(self._model, "config", None), "num_speakers", 0)
                if num_speakers and num_speakers > 1:
                    inference_kwargs["speaker_id"] = speaker_id
                else:
                    logger.debug(f"[TTS] Single-speaker model ignoring speaker_id={speaker_id}")

            with torch.inference_mode():
                output = self._model(**inputs, **{
                    k: v for k, v in inference_kwargs.items()
                    if k in self._model.forward.__code__.co_varnames
                })
        except TypeError:
            # Older transformers signature without noise/speaking_rate kwargs
            with torch.inference_mode():
                output = self._model(**inputs)
        except Exception as exc:
            raise RuntimeError(f"[TTS] VITS inference failed: {exc}") from exc

        # Extract waveform tensor → numpy float32
        waveform_tensor = output.waveform[0].cpu().float()
        audio_np: np.ndarray = waveform_tensor.numpy().squeeze()
        duration = round(len(audio_np) / self._sample_rate, 3)
        inference_ms = round((time.perf_counter() - t0) * 1000, 2)

        logger.success(
            f"[TTS] Synthesis done in {inference_ms}ms | "
            f"duration={duration}s | sr={self._sample_rate}Hz"
        )

        # ── Encode WAV for API transport ──────────────────────────────────
        audio_b64 = self._waveform_to_base64_wav(audio_np, self._sample_rate)
        wav_bytes = self._numpy_to_wav_bytes(audio_np, self._sample_rate)

        # ── Optional file save ────────────────────────────────────────────
        if output_wav_path:
            out_p = Path(output_wav_path)
            out_p.parent.mkdir(parents=True, exist_ok=True)
            out_p.write_bytes(wav_bytes)
            logger.info(f"[TTS] Audio saved to '{out_p}'")

        return {
            "audio_base64": audio_b64,
            "audio_array": audio_np,
            "sample_rate": self._sample_rate,
            "duration_seconds": duration,
            "inference_time_ms": inference_ms,
        }

    # ──────────────────────────────────────────────────────────────────────
    def synthesize_to_file(self, text: str, output_path: str, **kwargs) -> str:
        """Convenience method: synthesize and save to WAV, return file path."""
        self.synthesize(text, output_wav_path=output_path, **kwargs)
        return output_path

    # ──────────────────────────────────────────────────────────────────────
    def unload_model(self) -> None:
        """Frees VITS from memory."""
        if self._model is not None:
            import torch
            del self._model
            del self._tokenizer
            if self.device == "cuda":
                torch.cuda.empty_cache()
            self._model = None
            self._tokenizer = None
            self._model_loaded = False
            logger.info("[TTS] Model unloaded.")

    # ──────────────────────────────────────────────────────────────────────
    def health_check(self) -> Dict[str, Any]:
        try:
            import torch
            cuda_info = {
                "cuda_available": torch.cuda.is_available(),
                "cuda_device": torch.cuda.get_device_name(0) if torch.cuda.is_available() else None,
            }
        except ImportError:
            cuda_info = {"cuda_available": False, "cuda_device": None}

        return {
            "service": "TTS (VITS / MMS-TTS)",
            "model_loaded": self._model_loaded,
            "model_path": self.model_path,
            "device": self.device,
            "sample_rate": self._sample_rate,
            **cuda_info,
        }


# ── Singleton ─────────────────────────────────────────────────────────────────
tts_service = JanbhashaTTSService()
