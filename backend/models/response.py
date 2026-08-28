"""Standard API response models"""
from pydantic import BaseModel
from typing import Any, Optional, List


class APIResponse(BaseModel):
    success: bool
    message: str = ""
    data: Optional[Any] = None
    error_code: Optional[str] = None


class PaginatedResponse(BaseModel):
    success: bool
    data: List[Any]
    total: int
    page: int
    page_size: int
    has_more: bool


def ok(data: Any = None, message: str = "Success") -> dict:
    return {"success": True, "message": message, "data": data}


def error(message: str, code: str = "ERROR", data: Any = None) -> dict:
    return {"success": False, "message": message, "error_code": code, "data": data}
