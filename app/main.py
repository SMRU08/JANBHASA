#!/usr/bin/env python3
"""
Janbhasha Phase 4 — FastAPI Application Entry Point
Uses modern asynccontextmanager lifespan pattern (NOT deprecated @app.on_event).

Startup sequence:
  1. Read janbhasha_mt_config.json for model paths and hardware config
  2. Instantiate JanbhashaASRService, JanbhashaTranslationService, JanbhashaTTSService
  3. Call .load_model() on each service (loads weights from local disk into RAM/VRAM)
  4. Instantiate JanbhashaPipelineService with live service references
  5. Attach all service instances to app.state (FastAPI dependency injection)
  6. Begin accepting HTTP requests

Shutdown sequence:
  1. Call .unload_model() on each service (frees RAM/VRAM)
  2. Graceful ASGI shutdown
"""

import asyncio
import os
import sys
from contextlib import asynccontextmanager
from pathlib import Path

# ── Offline enforcement before any AI library loads ──────────────────────────
os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")
os.environ.setdefault("HF_DATASETS_OFFLINE", "1")
os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from loguru import logger

from app.core.config import settings
from app.core.middleware.timing import ProcessTimeMiddleware
from app.core.exceptions.handlers import (
    validation_exception_handler,
    http_exception_handler,
    generic_exception_handler,
    OfflineModelNotReadyError,
    model_not_ready_handler,
)


# ─────────────────────────────────────────────────────────────────────────────
# Loguru Configuration
# ─────────────────────────────────────────────────────────────────────────────

def configure_logging():
    """Configures structured loguru logging to stdout and rotating log file."""
    log_dir = Path(__file__).resolve().parent.parent / "logs"
    log_dir.mkdir(exist_ok=True)

    logger.remove()   # Remove default handler

    # Console: colourised, concise
    logger.add(
        sys.stdout,
        colorize=True,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{line}</cyan> — {message}",
        level="INFO",
        enqueue=True,   # Thread-safe from inference threads
    )

    # File: JSON-structured, rotating (10MB max, 7-day retention)
    logger.add(
        str(log_dir / "janbhasha_{time:YYYY-MM-DD}.log"),
        rotation="10 MB",
        retention="7 days",
        compression="gz",
        format="{time:YYYY-MM-DDTHH:mm:ss.fff} | {level} | {name}:{line} | {message}",
        level="DEBUG",
        enqueue=True,
    )


configure_logging()


# ─────────────────────────────────────────────────────────────────────────────
# Lifespan: Model Pre-loading & Cleanup
# ─────────────────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI lifespan context manager (replaces deprecated @app.on_event).

    Everything BEFORE 'yield' runs at startup.
    Everything AFTER  'yield' runs at shutdown.

    AI model weights are loaded into app.state so that every request handler
    can access them via request.app.state.{service_name} without global variables.
    """

    # ── Parse janbhasha_mt_config.json ────────────────────────────────────
    cfg = settings.raw_config
    hw   = cfg.get("hardware", {})
    asr_cfg   = cfg.get("asr",         {})
    mt_cfg    = cfg.get("translation",  {})
    tts_cfg   = cfg.get("tts",          {})
    device    = hw.get("device",        "cpu")
    quantize  = hw.get("quantization",  "int8")

    logger.info("=" * 64)
    logger.info(f"  Starting {settings.app_name} v{settings.version}")
    logger.info(f"  Device: {device.upper()} | Quantization: {quantize}")
    logger.info(f"  Offline mode: TRANSFORMERS_OFFLINE={os.environ['TRANSFORMERS_OFFLINE']}")
    logger.info("=" * 64)

    # ── Import AI service classes ──────────────────────────────────────────
    from app.services.asr_service         import JanbhashaASRService
    from app.services.translation_service import JanbhashaTranslationService
    from app.services.tts_service         import JanbhashaTTSService
    from app.services.pipeline_service    import JanbhashaPipelineService

    # ── 1. Instantiate services (no model loading yet) ────────────────────
    logger.info("[Startup] Instantiating AI services...")

    asr_service = JanbhashaASRService(
        model_path  = asr_cfg.get("model_size_or_path"),
        fallback_model_size = asr_cfg.get("fallback_model", "base"),
        device      = device,
        compute_type= quantize if device == "cpu" else "float16",
        beam_size   = asr_cfg.get("beam_size", 5),
        language    = asr_cfg.get("language") if asr_cfg.get("language") != "auto" else None,
        vad_filter  = True,
    )

    translation_service = JanbhashaTranslationService(
        model_path  = mt_cfg.get("model_path"),
        tokenizer_path = mt_cfg.get("tokenizer_path"),
        device      = device,
        num_beams   = mt_cfg.get("num_beams",         4),
        max_input_length  = mt_cfg.get("max_input_length",  256),
        max_target_length = mt_cfg.get("max_target_length", 256),
        use_mixed_precision = (device == "cuda"),
    )

    tts_service = JanbhashaTTSService(
        model_path = tts_cfg.get("model_path") or tts_cfg.get("config_path", "").replace("config.json", ""),
        device     = device,
    )

    # ── 2. Load model weights from local disk (blocking — runs in executor) ─
    logger.info("[Startup] Loading offline model weights... (this may take 30-90s)")
    loop = asyncio.get_event_loop()

    async def _load(name: str, svc):
        """Load a single model in the thread-pool, logging success/failure."""
        try:
            await loop.run_in_executor(None, svc.load_model)
            logger.success(f"[Startup] ✓ {name} loaded.")
        except FileNotFoundError as exc:
            logger.warning(
                f"[Startup] ⚠ {name}: model weights not found.\n"
                f"  → {exc}\n"
                f"  Server will start but {name} endpoints will return 503 until weights are placed."
            )
        except Exception as exc:
            logger.error(f"[Startup] ✗ {name} failed to load: {exc}")

    # Load all three models concurrently using asyncio.gather
    await asyncio.gather(
        _load("ASR (Whisper)",          asr_service),
        _load("Translation (IndicTrans2)", translation_service),
        _load("TTS (VITS/MMS-TTS)",     tts_service),
    )

    # ── 3. Build pipeline orchestrator with live service references ────────
    pipeline_service = JanbhashaPipelineService(
        asr=asr_service,
        translation=translation_service,
        tts=tts_service,
    )

    # ── 4. Attach everything to app.state (FastAPI's DI surface) ──────────
    app.state.asr_service         = asr_service
    app.state.translation_service = translation_service
    app.state.tts_service         = tts_service
    app.state.pipeline_service    = pipeline_service

    logger.success("[Startup] Janbhasha is READY — accepting requests.")
    logger.info(f"[Startup] Swagger UI → http://{settings.host}:{settings.port}/docs")

    # ── Hand control to FastAPI (yield = server is running) ───────────────
    yield

    # ── 5. Graceful Shutdown ───────────────────────────────────────────────
    logger.info("[Shutdown] Releasing AI model memory...")
    for name, svc in [
        ("ASR",         asr_service),
        ("Translation", translation_service),
        ("TTS",         tts_service),
    ]:
        try:
            svc.unload_model()
            logger.info(f"[Shutdown] ✓ {name} unloaded.")
        except Exception as exc:
            logger.warning(f"[Shutdown] {name} unload raised: {exc}")

    logger.success("[Shutdown] Janbhasha shut down cleanly.")


# ─────────────────────────────────────────────────────────────────────────────
# FastAPI Application Factory
# ─────────────────────────────────────────────────────────────────────────────

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description=(
        "**Janbhasha Offline AI Engine** — Privacy-preserving, fully offline "
        "regional language AI pipeline for Indian languages (Santhali, Hindi, English).\n\n"
        "**Pipeline flow:** `Speech/Text → NLP Normalization → IndicTrans2 Translation → VITS TTS`\n\n"
        "> All models run locally. No internet connection required or used after initial setup."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# ── Middleware ────────────────────────────────────────────────────────────────
# NOTE: Order matters — Starlette applies middleware in reverse stack order.
# CORS wraps everything; timing runs inside CORS.

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # Restrict to specific origins in production
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Process-Time-Ms"],
)

app.add_middleware(ProcessTimeMiddleware)

# ── Exception Handlers ────────────────────────────────────────────────────────
from fastapi import HTTPException as FastAPIHTTPException
from fastapi.exceptions import RequestValidationError

app.add_exception_handler(RequestValidationError,     validation_exception_handler)
app.add_exception_handler(FastAPIHTTPException,       http_exception_handler)
app.add_exception_handler(OfflineModelNotReadyError,  model_not_ready_handler)
app.add_exception_handler(Exception,                  generic_exception_handler)

# ── Routes ────────────────────────────────────────────────────────────────────
from app.api.v1.router import api_router
app.include_router(api_router, prefix="/api/v1")


# ── Root redirects to interactive Swagger UI documentation ────────────────────
@app.get("/", include_in_schema=False)
async def root():
    return RedirectResponse(url="/docs")
