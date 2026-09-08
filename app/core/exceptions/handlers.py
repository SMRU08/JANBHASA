#!/usr/bin/env python3
"""
Janbhasha Phase 4 — Global Exception Handlers & Custom HTTP Exceptions
Provides structured JSON error envelopes for all unhandled exceptions.
"""

import time
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from loguru import logger


class OfflineModelNotReadyError(Exception):
    """Raised when an AI service is accessed before its model is loaded."""
    def __init__(self, service_name: str):
        self.service_name = service_name
        super().__init__(f"{service_name} model not loaded. Call load_model() first.")


class ModelPathMissingError(Exception):
    """Raised when a local model weight path does not exist."""
    pass


# ──────────────────────────────────────────────────────────────────────────────
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Returns a 422 JSON envelope with field-level validation error details."""
    errors = exc.errors()
    logger.warning(f"[Validation] {request.url.path} | {len(errors)} error(s): {errors}")
    return JSONResponse(
        status_code=422,
        content={
            "error": "Request Validation Failed",
            "detail": errors,
            "endpoint": str(request.url.path),
        }
    )


async def http_exception_handler(request: Request, exc: HTTPException):
    """Returns structured JSON for all HTTPException instances."""
    logger.warning(f"[HTTP {exc.status_code}] {request.url.path} | {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": f"HTTP {exc.status_code}",
            "detail": exc.detail,
            "endpoint": str(request.url.path),
        }
    )


async def model_not_ready_handler(request: Request, exc: OfflineModelNotReadyError):
    logger.error(f"[ServiceUnavailable] {exc}")
    return JSONResponse(
        status_code=503,
        content={
            "error": "AI Service Not Ready",
            "detail": str(exc),
            "endpoint": str(request.url.path),
        }
    )


async def generic_exception_handler(request: Request, exc: Exception):
    """Catch-all for unexpected 500 errors — logs full traceback."""
    logger.exception(f"[Unhandled] {request.method} {request.url.path} raised {type(exc).__name__}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "detail": f"{type(exc).__name__}: {str(exc)}",
            "endpoint": str(request.url.path),
        }
    )
