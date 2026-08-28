"""OMR Scanner API - Evaluate answer sheets by detecting filled bubbles"""
import os, tempfile, logging, json
from fastapi import APIRouter, UploadFile, File, Request, Form
from models.response import ok, error
from services.ocr.omr_service import OMRService
from typing import Optional

logger = logging.getLogger("janbhasha.omr")
router = APIRouter()
_service: Optional[OMRService] = None


def get_service(request: Request) -> OMRService:
    global _service
    if _service is None:
        _service = OMRService()
    return _service


@router.post("/evaluate")
async def evaluate_omr(
    request: Request,
    image: UploadFile = File(...),
    answer_key: str = Form(...),      # JSON string: {"1":"A","2":"C",...}
    total_questions: int = Form(10),
    teacher_id: Optional[int] = Form(None),
    student_id: Optional[int] = Form(None),
    worksheet_id: Optional[int] = Form(None),
):
    """Scan OMR answer sheet and evaluate against answer key."""
    try:
        key = json.loads(answer_key)
    except Exception:
        return error("Invalid answer key format. Expected JSON object.", "INVALID_KEY")

    try:
        content = await image.read()
        suffix = os.path.splitext(image.filename or "omr.jpg")[1] or ".jpg"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(content)
            tmp_path = tmp.name

        svc = get_service(request)
        result = await svc.evaluate(tmp_path, key, total_questions, teacher_id, student_id, worksheet_id)
        os.unlink(tmp_path)
        return ok(result)

    except Exception as e:
        logger.error(f"OMR evaluation error: {e}")
        return error("OMR evaluation failed. Please ensure the sheet is clear and well-aligned.", "OMR_FAILED")
