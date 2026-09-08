#!/usr/bin/env python3
"""
Phase 3 Unit Tests — Janbhasha Core AI Services
Tests service configuration, offline enforcement, error handling, and mock inference.
"""
import os
import sys
import json
import tempfile
import unittest
import wave
import struct
from pathlib import Path
from unittest.mock import MagicMock, patch, PropertyMock

BASE_DIR = Path(__file__).resolve().parent.parent

# ──────────────────────────────────────────────────────────────────────────────
class TestASRServiceConfiguration(unittest.TestCase):
    """Tests for JanbhashaASRService configuration and offline enforcement."""

    def setUp(self):
        from app.services.asr_service import JanbhashaASRService
        self.ServiceClass = JanbhashaASRService

    def test_device_fallback_cpu(self):
        """Should default to CPU when no CUDA is available."""
        with patch("app.services.asr_service.JanbhashaASRService._resolve_device_and_dtype",
                   return_value=("cpu", "int8")):
            svc = self.ServiceClass(device="cpu")
            self.assertEqual(svc.device, "cpu")
            self.assertEqual(svc.compute_type, "int8")

    def test_model_path_resolution(self):
        """Should resolve model path relative to project BASE_DIR."""
        svc = self.ServiceClass(model_path="models/asr/test-model")
        self.assertIn("models", svc.model_path)
        self.assertIn("test-model", svc.model_path)

    def test_offline_enforcement_raises_on_missing_path(self):
        """Should raise FileNotFoundError for nonexistent local path — never download."""
        svc = self.ServiceClass(model_path="models/asr/nonexistent-xyz-123")
        with self.assertRaises(FileNotFoundError) as ctx:
            svc._verify_model_path()
        self.assertIn("OFFLINE ENFORCEMENT", str(ctx.exception))

    def test_unsupported_audio_format_rejected(self):
        """Should raise ValueError for unsupported file extensions."""
        svc = self.ServiceClass()
        svc._model_loaded = True  # Skip load
        with self.assertRaises(ValueError):
            svc._validate_audio_file("audio.xyz")

    def test_missing_audio_file_raises(self):
        """Should raise FileNotFoundError for nonexistent audio path."""
        svc = self.ServiceClass()
        svc._model_loaded = True
        with self.assertRaises(FileNotFoundError):
            svc._validate_audio_file("/nonexistent/audio.wav")

    def test_wav_duration_reading(self):
        """Should correctly read WAV duration from stdlib wave module."""
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp_path = tmp.name
        try:
            with wave.open(tmp_path, "wb") as wf:
                wf.setnchannels(1)
                wf.setsampwidth(2)
                wf.setframerate(16000)
                # 1 second of silence (16000 samples × 2 bytes)
                wf.writeframes(b"\x00\x00" * 16000)

            svc = self.ServiceClass()
            dur = svc._get_audio_duration(Path(tmp_path))
            self.assertAlmostEqual(dur, 1.0, places=1)
        finally:
            os.unlink(tmp_path)

    def test_health_check_structure(self):
        """Health check should return required keys."""
        svc = self.ServiceClass()
        hc = svc.health_check()
        for key in ("service", "model_loaded", "model_path", "device", "compute_type"):
            self.assertIn(key, hc)


# ──────────────────────────────────────────────────────────────────────────────
class TestTranslationServiceConfiguration(unittest.TestCase):
    """Tests for JanbhashaTranslationService configuration and offline enforcement."""

    def setUp(self):
        from app.services.translation_service import JanbhashaTranslationService
        self.ServiceClass = JanbhashaTranslationService

    def test_offline_enforcement_raises_on_missing_dir(self):
        """Should raise FileNotFoundError for missing model directory."""
        svc = self.ServiceClass(model_path="models/translation/nonexistent-abc")
        with self.assertRaises(FileNotFoundError) as ctx:
            svc._verify_model_path()
        self.assertIn("OFFLINE ENFORCEMENT", str(ctx.exception))

    def test_invalid_lang_code_raises(self):
        """Should raise ValueError for unsupported language codes."""
        svc = self.ServiceClass()
        svc._model_loaded = True
        svc._model = MagicMock()
        svc._tokenizer = MagicMock()
        svc._processor = None
        with self.assertRaises(ValueError):
            svc._validate_lang_codes("invalid_Code", "sat_Olck")

    def test_identical_src_tgt_raises(self):
        """Should reject translation when src == tgt."""
        svc = self.ServiceClass()
        with self.assertRaises(ValueError):
            svc._validate_lang_codes("sat_Olck", "sat_Olck")

    def test_model_path_resolution(self):
        svc = self.ServiceClass(model_path="models/translation/indictrans2-indic-indic-dist-200M")
        self.assertIn("indictrans2", svc.model_path)

    def test_health_check_structure(self):
        svc = self.ServiceClass()
        hc = svc.health_check()
        for key in ("service", "model_loaded", "model_path", "device"):
            self.assertIn(key, hc)


# ──────────────────────────────────────────────────────────────────────────────
class TestTTSServiceConfiguration(unittest.TestCase):
    """Tests for JanbhashaTTSService configuration and offline enforcement."""

    def setUp(self):
        from app.services.tts_service import JanbhashaTTSService
        self.ServiceClass = JanbhashaTTSService

    def test_offline_enforcement_raises_on_missing_dir(self):
        """Should raise FileNotFoundError for missing VITS model directory."""
        svc = self.ServiceClass(model_path="models/tts/nonexistent-vits")
        with self.assertRaises(FileNotFoundError) as ctx:
            svc._verify_model_path()
        self.assertIn("OFFLINE ENFORCEMENT", str(ctx.exception))

    def test_empty_text_rejected(self):
        """Should raise ValueError for empty or whitespace-only text."""
        svc = self.ServiceClass()
        svc._model_loaded = True
        svc._model = MagicMock()
        svc._tokenizer = MagicMock()
        with self.assertRaises(ValueError):
            svc.synthesize("")
        with self.assertRaises(ValueError):
            svc.synthesize("   ")

    def test_numpy_to_wav_bytes(self):
        """Should produce valid WAV bytes from numpy float32 array."""
        try:
            import numpy as np
        except ImportError:
            self.skipTest("numpy not installed")

        svc = self.ServiceClass()
        audio = np.zeros(22050, dtype=np.float32)   # 1 second of silence
        wav_bytes = svc._numpy_to_wav_bytes(audio, 22050)
        # Verify WAV magic header
        self.assertEqual(wav_bytes[:4], b"RIFF")
        self.assertEqual(wav_bytes[8:12], b"WAVE")

    def test_health_check_structure(self):
        svc = self.ServiceClass()
        hc = svc.health_check()
        for key in ("service", "model_loaded", "model_path", "device", "sample_rate"):
            self.assertIn(key, hc)


# ──────────────────────────────────────────────────────────────────────────────
class TestOfflineEnvGuard(unittest.TestCase):
    """Ensures offline environment flags are set by all services."""

    def test_asr_service_sets_offline_env(self):
        """After importing ASR service, TRANSFORMERS_OFFLINE must be '1'."""
        import app.services.asr_service  # noqa
        self.assertEqual(os.environ.get("TRANSFORMERS_OFFLINE"), "1")

    def test_translation_service_sets_offline_env(self):
        import app.services.translation_service  # noqa
        self.assertEqual(os.environ.get("TRANSFORMERS_OFFLINE"), "1")

    def test_tts_service_sets_offline_env(self):
        import app.services.tts_service  # noqa
        self.assertEqual(os.environ.get("TRANSFORMERS_OFFLINE"), "1")


# ──────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    unittest.main(verbosity=2)
