from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # API Configuration
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "AI Career Readiness Platform"

    # CORS Settings
    ALLOWED_ORIGINS: List[str] = ["*"]  # In production, replace with specific origins

    # Database
    DATABASE_URL: str = "sqlite:///./app.db"

    # LLM Configuration
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    MOCK_LLM: bool = os.getenv("MOCK_LLM", "true").lower() == "true"

    # File Upload Limits
    MAX_UPLOAD_SIZE: int = 5 * 1024 * 1024  # 5 MB

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()