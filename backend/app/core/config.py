from functools import lru_cache

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = Field(default="development", alias="APP_ENV")
    api_host: str = Field(default="0.0.0.0", alias="API_HOST")
    api_port: int = Field(default=8000, alias="API_PORT")
    webapp_url: str = Field(default="http://localhost:5173", alias="WEBAPP_URL")
    admin_url: str = Field(default="http://localhost:3001", alias="ADMIN_URL")
    telegram_bot_token: str = Field(default="replace_me", alias="TELEGRAM_BOT_TOKEN")
    jwt_secret: str = Field(default="replace_me", alias="JWT_SECRET")
    jwt_expires_minutes: int = Field(default=30, alias="JWT_EXPIRES_MINUTES")
    database_url: str = Field(default="sqlite:///./dev.db", alias="DATABASE_URL")
    project_name: str = "Halal TradePilot AI API"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @model_validator(mode="after")
    def validate_production_secrets(self) -> "Settings":
        if self.app_env.lower() == "production":
            jwt_secret = self.jwt_secret.strip()
            if jwt_secret == "replace_me" or len(jwt_secret) < 32:
                raise ValueError("JWT_SECRET must be configured for production")
            telegram_bot_token = self.telegram_bot_token.strip()
            if telegram_bot_token == "replace_me" or len(telegram_bot_token) < 16:
                raise ValueError("TELEGRAM_BOT_TOKEN must be configured for production")
        return self

    @property
    def cors_origins(self) -> list[str]:
        return [origin for origin in (self.webapp_url, self.admin_url) if origin]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
