"""OCR API - Extract text from images using Tesseract"""
import os, tempfile, logging
from fastapi import APIRouter, UploadFile, File, Request, Form
from models.response import ok, error
from services.ocr.ocr_service import OCRService
from typing import Optional

logger = logging.getLogger("janbhasha.ocr")
router = APIRouter()
_service: Optional[OCRService] = None


def get_service(request: Request) -> OCRService:
    global _service
    if _service is None:
        _service = OCRService(request.app.state.model_manager)
    return _service


@router.post("/extract")
async def extract_text(
    request: Request,
    image: UploadFile = File(...),
    source_lang: str = Form("hi"),
    translate_to: Optional[str] = Form(None),
    user_id: Optional[int] = Form(None),
):
    """Extract text from image (Hindi textbook, worksheet, etc.) via Tesseract OCR."""
    allowed = {"image/jpeg", "image/jpg", "image/png", "image/bmp", "image/tiff"}
    if image.content_type and image.content_type not in allowed:
        return error(f"Unsupported image format. Please use JPG or PNG.", "INVALID_FORMAT")

    try:
        content = await image.read()
        suffix = os.path.splitext(image.filename or "image.jpg")[1] or ".jpg"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(content)
            tmp_path = tmp.name

        svc = get_service(request)
        result = await svc.extract_text(tmp_path, source_lang, translate_to, user_id)
        os.unlink(tmp_path)
        return ok(result)

    except Exception as e:
        logger.error(f"OCR error: {e}")
        return error("Text extraction failed. Please ensure the image is clear and well-lit.", "OCR_FAILED")
