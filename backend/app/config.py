from pydantic_settings import BaseSettings
from typing import List
import os
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path, override=True)
else:
    load_dotenv()

DB_PATH = Path(__file__).resolve().parent.parent / "app.db"

class Settings(BaseSettings):
    # API Configuration
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "AI Career Readiness Platform"

    # CORS Settings
    ALLOWED_ORIGINS: List[str] = ["*"]  # In production, replace with specific origins

    # Database - Absolute path to backend/app.db
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{DB_PATH.as_posix()}")

    # LLM Configuration
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "groq")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "openai/gpt-oss-120b")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    MOCK_LLM: bool = os.getenv("MOCK_LLM", "false").lower() == "true"

    # File Upload Limits
    MAX_UPLOAD_SIZE: int = 5 * 1024 * 1024  # 5 MB

    class Config:
        env_file = str(env_path) if env_path.exists() else ".env"
        case_sensitive = True
        extra = "ignore"

settings = Settings()
