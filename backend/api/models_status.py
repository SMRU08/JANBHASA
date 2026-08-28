"""AI Model status API"""
import os
from fastapi import APIRouter, Request
from models.response import ok

router = APIRouter()


@router.get("/status")
async def model_status(request: Request):
    """Return status of all AI models."""
    manager = request.app.state.model_manager
    return ok(manager.get_full_status())


@router.post("/reload")
async def reload_models(request: Request):
    """Reload AI models (useful after installing a new model)."""
    manager = request.app.state.model_manager
    await manager.load_available_models()
    return ok(manager.get_full_status(), "Models reloaded.")
