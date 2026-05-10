
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    POSTGRES_USER: str = "facedetect"
    POSTGRES_PASSWORD: str = "facedetect"
    POSTGRES_DB: str = "facedetect"
    POSTGRES_HOST: str = "db"
    POSTGRES_PORT: int = 5432

    DATABASE_URL: str = ""

    APP_TITLE: str = "Face Detection API"
    APP_VERSION: str = "1.0.0"
    APP_DESCRIPTION: str = "Real-time face detection and ROI streaming service"
    CORS_ORIGINS: str = "*"

    @property
    def database_url_resolved(self) -> str:
        
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

settings = Settings()