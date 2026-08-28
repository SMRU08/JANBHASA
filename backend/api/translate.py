"""Translation API - Offline Hindi ↔ Regional/Tribal language translation"""
import logging
from fastapi import APIRouter, Request
from pydantic import BaseModel
from typing import Optional
from models.response import ok, error
from services.translation.translation_service import TranslationService

logger = logging.getLogger("janbhasha.translate")
router = APIRouter()
_service: Optional[TranslationService] = None


def get_service(request: Request) -> TranslationService:
    global _service
    if _service is None:
        _service = TranslationService(request.app.state.model_manager)
    return _service


class TranslateRequest(BaseModel):
    text: str
    source_lang: str = "hi"
    target_lang: str = "en"
    use_cache: bool = True


class BatchTranslateRequest(BaseModel):
    text: str
    source_lang: str = "hi"
    target_langs: list[str] = ["en", "sat", "or"]


@router.post("/translate")
async def translate_text(req: TranslateRequest, request: Request):
    """Translate text between supported Indian languages (offline)."""
    if not req.text.strip():
        return error("Text cannot be empty.", "EMPTY_TEXT")
    if req.source_lang == req.target_lang:
        return ok({"translated_text": req.text, "source_lang": req.source_lang, "target_lang": req.target_lang})

    svc = get_service(request)
    result = await svc.translate(req.text, req.source_lang, req.target_lang, req.use_cache)
    return ok(result)


@router.post("/translate/batch")
async def translate_batch(req: BatchTranslateRequest, request: Request):
    """Translate text to multiple languages at once (for classroom broadcast)."""
    if not req.text.strip():
        return error("Text cannot be empty.", "EMPTY_TEXT")

    svc = get_service(request)
    results = {}
    for lang in req.target_langs:
        if lang == req.source_lang:
            results[lang] = req.text
        else:
            r = await svc.translate(req.text, req.source_lang, lang)
            results[lang] = r.get("translated_text", req.text)

    return ok({"source_text": req.text, "source_lang": req.source_lang, "translations": results})


@router.get("/translate/languages")
async def supported_languages():
    """Return list of supported language pairs."""
    return ok({
        "languages": [
            {"code": "hi", "name": "Hindi", "native": "हिंदी", "script": "Devanagari"},
            {"code": "en", "name": "English", "native": "English", "script": "Latin"},
            {"code": "or", "name": "Odia", "native": "ଓଡ଼ିଆ", "script": "Odia"},
            {"code": "sat", "name": "Santali", "native": "ᱥᱟᱱᱛᱟᱲᱤ", "script": "Ol_Chiki"},
            {"code": "ho", "name": "Ho", "native": "हो", "script": "Latin"},
            {"code": "mun", "name": "Mundari", "native": "मुंडारी", "script": "Devanagari"},
        ],
        "pairs": [
            "hi-en", "en-hi", "hi-or", "or-hi", "hi-sat", "hi-ho", "hi-mun"
        ]
    })
