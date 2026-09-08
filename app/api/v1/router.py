from fastapi import APIRouter
from app.api.v1.endpoints import asr, nlp, translation, tts, pipeline
from app.api.v1 import health

api_router = APIRouter()

api_router.include_router(health.router,       prefix="/health",      tags=["System Health"])
api_router.include_router(asr.router,          prefix="/asr",         tags=["1. Speech Recognition (Whisper)"])
api_router.include_router(nlp.router,          prefix="/nlp",         tags=["2. Bilingual NLP & Normalization"])
api_router.include_router(translation.router,  prefix="/translation",  tags=["3. Offline Machine Translation (IndicTrans2)"])
api_router.include_router(tts.router,          prefix="/tts",         tags=["4. Speech Synthesis (VITS)"])
api_router.include_router(pipeline.router,     prefix="/pipeline",    tags=["5. End-to-End Multilingual Pipeline"])
