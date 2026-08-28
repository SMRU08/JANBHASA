"""
OCR Service - Extract text from images using Tesseract + OpenCV preprocessing.
Supports Hindi, Odia, English educational content.
"""
import asyncio
import logging
from pathlib import Path
from typing import Optional
from database.db import execute

logger = logging.getLogger("janbhasha.ocr")

TESSERACT_LANG_MAP = {
    "hi": "hin", "en": "eng", "or": "ori",
    "sat": "hin",  # Use Hindi OCR for Santali if Ol Chiki not available
    "ho": "hin",
    "mun": "hin",
}


class OCRService:
    def __init__(self, model_manager):
        self.manager = model_manager

    async def extract_text(
        self, image_path: str, source_lang: str = "hi",
        translate_to: Optional[str] = None, user_id: Optional[int] = None
    ) -> dict:
        if not self.manager.is_tesseract_available():
            return {
                "success": False,
                "extracted_text": "",
                "error": "OCR engine not available. Please install Tesseract: sudo apt install tesseract-ocr tesseract-ocr-hin"
            }

        try:
            loop = asyncio.get_event_loop()
            extracted = await loop.run_in_executor(None, lambda: self._extract(image_path, source_lang))

            translated_text = None
            if translate_to and translate_to != source_lang and extracted:
                from services.translation.translation_service import TranslationService
                svc = TranslationService(self.manager)
                t = await svc.translate(extracted, source_lang, translate_to)
                translated_text = t.get("translated_text")

            # Save to OCR history
            if user_id:
                try:
                    await execute(
                        """INSERT INTO ocr_history (user_id, image_path, extracted_text, translated_text, target_lang)
                           VALUES (?,?,?,?,?)""",
                        (user_id, image_path, extracted, translated_text, translate_to)
                    )
                except Exception:
                    pass

            return {
                "success": True,
                "extracted_text": extracted,
                "translated_text": translated_text,
                "source_lang": source_lang,
                "target_lang": translate_to,
            }
        except Exception as e:
            logger.error(f"OCR error: {e}")
            return {"success": False, "extracted_text": "", "error": str(e)}

    def _extract(self, image_path: str, lang: str) -> str:
        import cv2
        import pytesseract
        import numpy as np

        # Read image
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError("Could not read image file")

        # Preprocessing for better OCR accuracy
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        # Denoise
        denoised = cv2.fastNlMeansDenoising(gray, h=10)
        # Adaptive thresholding
        thresh = cv2.adaptiveThreshold(
            denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
        )
        # Deskew (simple)
        coords = np.column_stack(np.where(thresh > 0))
        if len(coords) > 0:
            angle = cv2.minAreaRect(coords)[-1]
            if angle < -45:
                angle = 90 + angle
            if abs(angle) > 0.5:
                h, w = thresh.shape
                M = cv2.getRotationMatrix2D((w // 2, h // 2), angle, 1.0)
                thresh = cv2.warpAffine(thresh, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

        tess_lang = TESSERACT_LANG_MAP.get(lang, "hin")
        # Try with selected language, fallback to combined
        try:
            text = pytesseract.image_to_string(thresh, lang=tess_lang, config="--psm 6")
        except Exception:
            text = pytesseract.image_to_string(thresh, lang="hin+eng", config="--psm 6")

        return text.strip()
