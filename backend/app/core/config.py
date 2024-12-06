from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional

class Settings(BaseSettings):
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Belcorp Shop API"
    
    # CORS Configuration
    BACKEND_CORS_ORIGINS: list = ["*"]
    
    # JWT Configuration
    SECRET_KEY: str = "your-secret-key-here"  # Change in production
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Belcorp Configuration
    BELCORP_USERNAME: Optional[str] = None
    BELCORP_PASSWORD: Optional[str] = None
    
    # WhatsApp Configuration
    WHATSAPP_API_KEY: Optional[str] = None
    WHATSAPP_PHONE_NUMBER: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    return Settings()
