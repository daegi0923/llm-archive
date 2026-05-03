from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from core.config import settings
from core.database import engine, Base
import models  # 모든 모델 로드
from api.router import api_router
from core.qdrant import get_qdrant_client
from services.vector_store import init_qdrant_collection

import logging
import google.generativeai as genai

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 0. Check Gemini Models
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        logger.info("--- Available Gemini Models ---")
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                logger.info(f"Model: {m.name}")
    except Exception as e:
        logger.error(f"Failed to list models: {e}")

    # 1. Create DB Tables
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")

    # 2. Initialize Qdrant Collection
    try:
        client = get_qdrant_client()
        await init_qdrant_collection(client)
        logger.info("Qdrant collection initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing Qdrant: {e}")

    yield


app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Welcome to Brain-Sync API!"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
