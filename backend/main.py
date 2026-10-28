"""
Food Verse AI — FastAPI Backend Application.
"""

from __future__ import annotations

import sys
from pathlib import Path

# Ensure project root is in sys.path so imports like 'backend.config' resolve
# whether invoked from project root or inside the backend directory.
CURRENT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = CURRENT_DIR.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.config import settings
from backend.database import init_db
from backend.models.schemas import APIConfigRequest, APIConfigResponse, HealthResponse
from backend.routers import nutrition, freshness, hygiene, recipe, meal_planner

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("foodverse")

app = FastAPI(
    title=settings.APP_NAME,
    description="Multimodal Food Intelligence Agent — Skill Wallet Capstone Project 3",
    version="2.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include module routers
app.include_router(nutrition.router)
app.include_router(freshness.router)
app.include_router(hygiene.router)
app.include_router(recipe.router)
app.include_router(meal_planner.router)


@app.on_event("startup")
def on_startup():
    init_db()
    logger.info("Database initialized successfully.")


@app.get("/", tags=["system"])
async def root():
    return {
        "message": f"Welcome to {settings.APP_NAME} Backend API",
        "version": "2.0.0",
        "demo_mode": settings.effective_demo_mode,
        "ai_provider": settings.AI_PROVIDER,
        "docs_url": "/docs"
    }


@app.get("/api/health", response_model=HealthResponse, tags=["system"])
async def health():
    return HealthResponse(
        status="healthy",
        app_name=settings.APP_NAME,
        demo_mode=settings.effective_demo_mode,
        ai_provider=settings.AI_PROVIDER
    )


@app.post("/api/config", response_model=APIConfigResponse, tags=["system"])
async def update_config(req: APIConfigRequest):
    provider = req.provider.lower().strip()
    if provider not in ("gemini", "groq", "llama"):
        raise HTTPException(status_code=400, detail="Invalid provider. Must be 'gemini', 'groq', or 'llama'")

    settings.AI_PROVIDER = provider
    if req.api_key:
        if provider == "gemini":
            settings.GEMINI_API_KEY = req.api_key
        elif provider == "groq":
            settings.GROQ_API_KEY = req.api_key
        elif provider == "llama":
            settings.LLAMA_MODEL_PATH = req.api_key

    is_demo = settings.effective_demo_mode
    mode_text = "Demo Mode" if is_demo else f"Live Mode ({provider.upper()})"

    return APIConfigResponse(
        valid=True,
        provider=provider,
        demo_mode=is_demo,
        message=f"Configuration updated: now running in {mode_text}"
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
