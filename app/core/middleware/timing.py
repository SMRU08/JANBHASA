#!/usr/bin/env python3
"""
Janbhasha Phase 4 — Timing Middleware
Injects X-Process-Time-Ms header into every response for latency monitoring.
"""

import time
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from loguru import logger


class ProcessTimeMiddleware(BaseHTTPMiddleware):
    """
    Middleware that:
    1. Records wall-clock time for every HTTP request.
    2. Injects X-Process-Time-Ms header into every response.
    3. Logs method, path, status code, and latency at INFO level.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        t0 = time.perf_counter()
        response: Response = await call_next(request)
        elapsed_ms = round((time.perf_counter() - t0) * 1000, 2)
        response.headers["X-Process-Time-Ms"] = str(elapsed_ms)
        logger.info(
            f"{request.method} {request.url.path} → {response.status_code} "
            f"| {elapsed_ms}ms"
        )
        return response
