#!/usr/bin/env python3
"""Phase 4 Unit Tests — API, Lifespan, Pipeline Routing, Schema Validation."""

import asyncio
import json
import os
import sys
import tempfile
import unittest
import wave
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

BASE_DIR = Path(__file__).resolve().parent.parent


# ──────────────────────────────────────────────────────────────────────────────
class TestPipelineSchemas(unittest.TestCase):
    """Pydantic schema validation tests."""

    def setUp(self):
        from app.schemas.pipeline import (
            PipelineTextRequest, TranslationRequest, TTSRequest, NLPProcessRequest
        )
        self.PipelineTextRequest = PipelineTextRequest
        self.TranslationRequest  = TranslationRequest
        self.TTSRequest          = TTSRequest
        self.NLPProcessRequest   = NLPProcessRequest

    def test_pipeline_text_request_valid(self):
        req = self.PipelineTextRequest(
            text="नमस्ते", source_lang="hin_Deva", target_lang="sat_Olck"
        )
        self.assertEqual(req.source_lang, "hin_Deva")
        self.assertEqual(req.target_lang, "sat_Olck")

    def test_pipeline_text_request_same_lang_fails(self):
        from pydantic import ValidationError
        with self.assertRaises(ValidationError):
            self.PipelineTextRequest(
                text="test", source_lang="sat_Olck", target_lang="sat_Olck"
            )

    def test_pipeline_text_request_invalid_lang_fails(self):
        from pydantic import ValidationError
        with self.assertRaises(ValidationError):
            self.PipelineTextRequest(
                text="test", source_lang="xyz_Latn", target_lang="sat_Olck"
            )

    def test_pipeline_text_request_empty_text_fails(self):
        from pydantic import ValidationError
        with self.assertRaises(ValidationError):
            self.PipelineTextRequest(
                text="   ", source_lang="hin_Deva", target_lang="sat_Olck"
            )

    def test_translation_request_src_tgt_identical_fails(self):
        from pydantic import ValidationError
        with self.assertRaises(ValidationError):
            self.TranslationRequest(
                text="hello", source_lang="eng_Latn", target_lang="eng_Latn"
            )

    def test_tts_request_valid(self):
        req = self.TTSRequest(text="ᱡᱚᱦᱟᱨ", language="sat_Olck")
        self.assertEqual(req.text, "ᱡᱚᱦᱟᱨ")
        self.assertIsNone(req.speaker_id)

    def test_nlp_process_request_valid(self):
        req = self.NLPProcessRequest(text="Hello ᱡᱚᱦᱟᱨ", target_script="sat_Olck")
        self.assertIn("Hello", req.text)


# ──────────────────────────────────────────────────────────────────────────────
class TestPipelineServiceAsync(unittest.IsolatedAsyncioTestCase):
    """Async tests for JanbhashaPipelineService with mocked AI services."""

    async def asyncSetUp(self):
        # Build mock AI services
        self.mock_asr = MagicMock()
        self.mock_asr.transcribe = MagicMock(return_value={
            "transcription": "नमस्ते डॉक्टर",
            "detected_language": "hi",
            "language_probability": 0.97,
            "duration_seconds": 2.1,
            "segments": [],
            "inference_time_ms": 320.0,
        })

        self.mock_translation = MagicMock()
        self.mock_translation.translate = MagicMock(return_value={
            "source_text": "नमस्ते ᱨᱟᱨᱟᱱᱤᱡ",
            "translated_text": "ᱡᱚᱦᱟᱨ ᱨᱟᱨᱟᱱᱤᱡ",
            "source_lang": "hin_Deva",
            "target_lang": "sat_Olck",
            "model_version": "indictrans2-test",
            "inference_time_ms": 410.0,
        })

        self.mock_tts = MagicMock()
        self.mock_tts.synthesize = MagicMock(return_value={
            "audio_base64": "UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=",
            "audio_array": None,
            "sample_rate": 22050,
            "duration_seconds": 1.8,
            "inference_time_ms": 550.0,
        })

    async def test_process_text_returns_expected_fields(self):
        from app.services.pipeline_service import JanbhashaPipelineService
        svc = JanbhashaPipelineService(
            asr=self.mock_asr,
            translation=self.mock_translation,
            tts=self.mock_tts,
        )
        result = await svc.process_text(
            text="नमस्ते डॉक्टर",
            source_lang="hin_Deva",
            target_lang="sat_Olck",
            return_audio=True,
        )
        self.assertIn("translated_text",    result)
        self.assertIn("preprocessed_text",  result)
        self.assertIn("is_code_mixed",      result)
        self.assertIn("audio_base64",       result)
        self.assertIn("processing_time_ms", result)
        self.assertIsNotNone(result["audio_base64"])
        self.mock_translation.translate.assert_called_once()
        self.mock_tts.synthesize.assert_called_once()

    async def test_process_text_no_audio(self):
        from app.services.pipeline_service import JanbhashaPipelineService
        svc = JanbhashaPipelineService(
            asr=self.mock_asr,
            translation=self.mock_translation,
            tts=self.mock_tts,
        )
        result = await svc.process_text(
            text="school kahan hai",
            source_lang="hin_Deva",
            target_lang="sat_Olck",
            return_audio=False,
        )
        self.assertIsNone(result["audio_base64"])
        self.mock_tts.synthesize.assert_not_called()

    async def test_process_audio_calls_asr_then_text_pipeline(self):
        from app.services.pipeline_service import JanbhashaPipelineService
        import tempfile, wave

        # Create a tiny real WAV file for the mock to receive
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            with wave.open(tmp.name, "wb") as wf:
                wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(16000)
                wf.writeframes(b"\x00\x00" * 1600)
            tmp_path = tmp.name

        svc = JanbhashaPipelineService(
            asr=self.mock_asr,
            translation=self.mock_translation,
            tts=self.mock_tts,
        )
        result = await svc.process_audio(
            audio_file_path=tmp_path,
            target_lang="sat_Olck",
            return_audio=False,
        )
        os.unlink(tmp_path)
        self.mock_asr.transcribe.assert_called_once()
        self.assertIn("asr_transcript",          result)
        self.assertIn("asr_detected_language",   result)
        self.assertEqual(result["asr_detected_language"], "hi")


# ──────────────────────────────────────────────────────────────────────────────
class TestExceptionHandlers(unittest.IsolatedAsyncioTestCase):
    """Tests structured error envelope handlers."""

    async def test_model_not_ready_handler_returns_503(self):
        from app.core.exceptions.handlers import (
            OfflineModelNotReadyError, model_not_ready_handler
        )
        mock_request = MagicMock()
        mock_request.url.path = "/api/v1/pipeline/translate-text"
        exc = OfflineModelNotReadyError("Translation")
        response = await model_not_ready_handler(mock_request, exc)
        self.assertEqual(response.status_code, 503)
        body = json.loads(response.body)
        self.assertIn("error", body)
        self.assertIn("AI Service Not Ready", body["error"])


# ──────────────────────────────────────────────────────────────────────────────
class TestOfflineEnvAndMain(unittest.TestCase):
    """Verifies TRANSFORMERS_OFFLINE is set before server starts."""

    def test_offline_env_set_by_main(self):
        import app.main  # noqa
        self.assertEqual(os.environ.get("TRANSFORMERS_OFFLINE"), "1")
        self.assertEqual(os.environ.get("HF_HUB_OFFLINE"),       "1")

    def test_app_has_lifespan(self):
        from app.main import app
        self.assertIsNotNone(app.router.lifespan_context)

    def test_root_endpoint_registered(self):
        from app.main import app
        routes = [r.path for r in app.routes if hasattr(r, "path")]
        self.assertIn("/", routes)


# ──────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    unittest.main(verbosity=2)
