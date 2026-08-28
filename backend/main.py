"""
JANBHASHA Backend - FastAPI Main Application
Offline-first AI-powered multilingual education platform
"""

import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from database.db import init_db
from services.models.model_manager import ModelManager
from api import auth, translate, stt, tts, ocr, omr, classroom, admin, teacher, student, content, models_status

load_dotenv()

logging.basicConfig(
    level=getattr(logging, os.getenv("LOG_LEVEL", "INFO")),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("janbhasha")

model_manager = ModelManager()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle."""
    logger.info("🚀 JANBHASHA Backend starting up...")
    await init_db()
    logger.info("✅ Database initialized")
    await model_manager.load_available_models()
    logger.info(f"✅ AI Models loaded: {model_manager.get_status_summary()}")
    app.state.model_manager = model_manager
    yield
    logger.info("🛑 JANBHASHA Backend shutting down...")


app = FastAPI(
    title="JANBHASHA API",
    description="Offline-first AI-powered multilingual education platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(translate.router, prefix="/api", tags=["Translation"])
app.include_router(stt.router, prefix="/api/stt", tags=["Speech-to-Text"])
app.include_router(tts.router, prefix="/api/tts", tags=["Text-to-Speech"])
app.include_router(ocr.router, prefix="/api/ocr", tags=["OCR"])
app.include_router(omr.router, prefix="/api/omr", tags=["OMR"])
app.include_router(classroom.router, prefix="/api/classroom", tags=["Classroom"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(teacher.router, prefix="/api/teacher", tags=["Teacher"])
app.include_router(student.router, prefix="/api/student", tags=["Student"])
app.include_router(content.router, prefix="/api/content", tags=["Content"])
app.include_router(models_status.router, prefix="/api/models", tags=["AI Models"])


@app.get("/")
async def root():
    return {
        "app": "JANBHASHA",
        "version": "1.0.0",
        "tagline": "Teach in Hindi. Learn in Your Mother Tongue.",
        "status": "running",
        "team": "Team Xerses"
    }


@app.get("/health")
async def health():
    return {"status": "ok", "models": app.state.model_manager.get_status_summary()}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=os.getenv("BACKEND_HOST", "0.0.0.0"),
        port=int(os.getenv("BACKEND_PORT", 8000)),
        reload=False,
        log_level="info",
    )
