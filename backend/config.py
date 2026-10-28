"""
Application configuration loaded from environment variables and .env file.
"""

from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central settings for the Food Verse AI application."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_NAME: str = "Food Verse AI"
    DATABASE_URL: str = "sqlite:///./foodverse.db"

    # AI provider selection: gemini | groq | llama
    AI_PROVIDER: str = "gemini"

    # Provider API keys
    GEMINI_API_KEY: str = ""
    GROQ_API_KEY: str = ""

    # Local model path for LLaVA / Llama
    LLAMA_MODEL_PATH: str = ""

    # When True the app returns curated demo data instead of calling AI
    DEMO_MODE: bool = True

    # CORS allowed origins
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]

    @property
    def effective_demo_mode(self) -> bool:
        """Auto-enable demo mode when no keys / model path are configured."""
        if self.DEMO_MODE:
            return True
        if self.AI_PROVIDER == "gemini" and not self.GEMINI_API_KEY:
            return True
        if self.AI_PROVIDER == "groq" and not self.GROQ_API_KEY:
            return True
        if self.AI_PROVIDER == "llama" and not self.LLAMA_MODEL_PATH:
            return True
        return False


settings = Settings()
