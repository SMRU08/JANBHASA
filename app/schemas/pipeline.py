#!/usr/bin/env python3
"""
Janbhasha Phase 4 — Complete Pydantic Schema Definitions
Covers ASR, NLP, Translation, TTS, and Pipeline request/response contracts.
All schemas include field-level validation, examples, and JSON serialisation config.
"""

from __future__ import annotations
import re
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field, field_validator, model_validator


# ─────────────────────────────────────────────────────────────────────────────
# Common / Shared
# ─────────────────────────────────────────────────────────────────────────────

VALID_INDICTRANS2_CODES = {
    "hin_Deva", "eng_Latn", "sat_Olck", "ben_Beng", "tel_Telu",
    "tam_Taml", "kan_Knda", "mal_Mlym", "mar_Deva", "guj_Gujr",
    "pan_Guru", "urd_Arab", "asm_Beng", "ory_Orya", "mai_Deva",
    "san_Deva", "brx_Deva", "mni_Mtei", "mni_Beng", "doi_Deva",
    "kon_Deva", "snd_Arab", "kas_Arab", "kas_Deva",
}


class OfflineServiceStatus(BaseModel):
    """Status block returned from health-check endpoints."""
    service: str
    model_loaded: bool
    model_path: str
    device: str
    cuda_available: bool
    cuda_device: Optional[str] = None

    model_config = {"from_attributes": True}


class SystemHealthResponse(BaseModel):
    status: str = Field(..., examples=["healthy"])
    app_name: str
    version: str
    offline_ready: bool
    services: Dict[str, OfflineServiceStatus]


# ─────────────────────────────────────────────────────────────────────────────
# ASR (Speech-to-Text)
# ─────────────────────────────────────────────────────────────────────────────

class WordTimestamp(BaseModel):
    word: str
    start: float = Field(..., description="Segment start in seconds")
    end: float = Field(..., description="Segment end in seconds")
    probability: float = Field(..., ge=0.0, le=1.0)


class ASRSegment(BaseModel):
    id: int
    start: float
    end: float
    text: str
    avg_logprob: float
    no_speech_prob: float
    words: List[WordTimestamp] = []


class ASRResponse(BaseModel):
    transcription: str
    detected_language: str
    language_probability: float = Field(..., ge=0.0, le=1.0)
    duration_seconds: Optional[float] = None
    segments: List[ASRSegment] = []
    inference_time_ms: float

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────────────────────────────────────
# NLP Preprocessing
# ─────────────────────────────────────────────────────────────────────────────

class NLPProcessRequest(BaseModel):
    text: str = Field(
        ...,
        min_length=1,
        max_length=2048,
        examples=["ᱡᱚᱦᱟᱨ! aapka hospital kahan hai?"],
        description="Raw bilingual or code-mixed input query"
    )
    target_script: str = Field(
        default="sat_Olck",
        examples=["sat_Olck", "hin_Deva"],
        description="Target IndicTrans2 language code for normalization"
    )

    @field_validator("text")
    @classmethod
    def text_must_not_be_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("text must not be blank or whitespace-only.")
        return v


class TokenScriptTag(BaseModel):
    token: str
    script: str
    language_hint: Optional[str] = None


class NLPProcessResponse(BaseModel):
    original_text: str
    cleaned_text: str
    is_code_mixed: bool
    script_composition: Dict[str, float]
    token_tags: List[TokenScriptTag]
    normalized_for_translation: str


# ─────────────────────────────────────────────────────────────────────────────
# Translation
# ─────────────────────────────────────────────────────────────────────────────

class TranslationRequest(BaseModel):
    text: str = Field(
        ...,
        min_length=1,
        max_length=2048,
        examples=["नमस्ते, आप कैसे हैं?"],
        description="Source text to translate (already NLP-normalized)"
    )
    source_lang: str = Field(
        default="hin_Deva",
        examples=["hin_Deva", "eng_Latn"],
        description="IndicTrans2 source language code"
    )
    target_lang: str = Field(
        default="sat_Olck",
        examples=["sat_Olck", "hin_Deva"],
        description="IndicTrans2 target language code"
    )

    @field_validator("source_lang", "target_lang")
    @classmethod
    def validate_lang_code(cls, v: str) -> str:
        if v not in VALID_INDICTRANS2_CODES:
            raise ValueError(
                f"'{v}' is not a valid IndicTrans2 language code. "
                f"Valid codes: {sorted(VALID_INDICTRANS2_CODES)}"
            )
        return v

    @model_validator(mode="after")
    def src_tgt_must_differ(self) -> TranslationRequest:
        if self.source_lang == self.target_lang:
            raise ValueError("source_lang and target_lang must be different.")
        return self


class TranslationResponse(BaseModel):
    source_text: str
    translated_text: str
    source_lang: str
    target_lang: str
    model_version: str
    inference_time_ms: float


# ─────────────────────────────────────────────────────────────────────────────
# TTS (Text-to-Speech)
# ─────────────────────────────────────────────────────────────────────────────

class TTSRequest(BaseModel):
    text: str = Field(
        ...,
        min_length=1,
        max_length=1024,
        examples=["ᱡᱚᱦᱟᱨ!"],
        description="Text in target language to synthesize to speech"
    )
    language: str = Field(
        default="sat_Olck",
        description="Target language code (informational)"
    )
    speaker_id: Optional[int] = Field(
        default=None,
        ge=0,
        description="Speaker ID for multi-speaker VITS models"
    )


class TTSResponse(BaseModel):
    audio_base64: str = Field(..., description="Base64-encoded WAV audio payload")
    sample_rate: int
    duration_seconds: float
    inference_time_ms: float


# ─────────────────────────────────────────────────────────────────────────────
# End-to-End Pipeline
# ─────────────────────────────────────────────────────────────────────────────

class PipelineTextRequest(BaseModel):
    """Request for the text-in → translated audio-out pipeline."""
    text: str = Field(
        ...,
        min_length=1,
        max_length=2048,
        examples=["मैं अस्पताल जाना चाहता हूँ"],
        description="Source text (Hindi, English, or code-mixed)"
    )
    source_lang: str = Field(
        default="hin_Deva",
        examples=["hin_Deva", "eng_Latn"],
        description="IndicTrans2 source language code"
    )
    target_lang: str = Field(
        default="sat_Olck",
        description="IndicTrans2 target language code"
    )
    return_audio: bool = Field(
        default=True,
        description="Whether to synthesize and return TTS audio"
    )
    speaker_id: Optional[int] = Field(default=None, ge=0)

    @field_validator("text")
    @classmethod
    def text_must_not_be_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("text must not be blank or whitespace-only.")
        return v

    @field_validator("source_lang", "target_lang")
    @classmethod
    def validate_lang_code(cls, v: str) -> str:
        if v not in VALID_INDICTRANS2_CODES:
            raise ValueError(f"'{v}' is not a valid IndicTrans2 language code.")
        return v

    @model_validator(mode="after")
    def src_tgt_must_differ(self) -> "PipelineTextRequest":
        if self.source_lang == self.target_lang:
            raise ValueError("source_lang and target_lang must be different.")
        return self


class PipelineAudioRequest(BaseModel):
    """
    Metadata companion for audio-in pipeline requests.
    Audio bytes are received as UploadFile; this carries sidecar parameters.
    """
    asr_language: Optional[str] = Field(
        default=None,
        examples=["hi", "en", "sat"],
        description="Whisper ASR language hint (Whisper 2-char ISO code). None = auto-detect."
    )
    target_lang: str = Field(
        default="sat_Olck",
        description="IndicTrans2 target language code for translation output"
    )
    return_audio: bool = Field(
        default=True,
        description="Whether to synthesize output to audio"
    )
    speaker_id: Optional[int] = Field(default=None, ge=0)


class PipelineResponse(BaseModel):
    """Unified response for both text-in and audio-in pipelines."""
    input_text: str
    preprocessed_text: str
    is_code_mixed: bool
    translated_text: str
    source_lang: str
    target_lang: str
    audio_base64: Optional[str] = Field(
        default=None,
        description="Base64-encoded WAV output. None if return_audio=False."
    )
    audio_sample_rate: Optional[int] = None
    audio_duration_seconds: Optional[float] = None
    # ASR-specific fields (only populated for audio-in pipeline)
    asr_transcript: Optional[str] = None
    asr_detected_language: Optional[str] = None
    asr_language_probability: Optional[float] = None
    processing_time_ms: float


class ErrorResponse(BaseModel):
    """Structured error envelope for all API errors."""
    error: str
    detail: Optional[str] = None
    endpoint: Optional[str] = None
    processing_time_ms: Optional[float] = None
