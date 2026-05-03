from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Brain-Sync API"
    DATABASE_URL: str = "postgresql://user:password@db:5432/brain_sync"
    QDRANT_URL: str = "http://qdrant:6333"
    GEMINI_API_KEY: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
