import pytest

from backend.app.core.config import Settings


PRODUCTION_JWT_SECRET = "a-production-secret-at-least-32-chars"
PRODUCTION_TELEGRAM_BOT_TOKEN = "123456789:production-telegram-token"


def test_production_rejects_placeholder_jwt_secret() -> None:
    with pytest.raises(ValueError):
        Settings(APP_ENV="production", JWT_SECRET="replace_me")


def test_production_rejects_short_jwt_secret() -> None:
    with pytest.raises(ValueError):
        Settings(
            APP_ENV="production",
            JWT_SECRET="short",
            TELEGRAM_BOT_TOKEN=PRODUCTION_TELEGRAM_BOT_TOKEN,
        )


def test_production_accepts_configured_jwt_secret() -> None:
    settings = Settings(
        APP_ENV="production",
        JWT_SECRET=PRODUCTION_JWT_SECRET,
        TELEGRAM_BOT_TOKEN=PRODUCTION_TELEGRAM_BOT_TOKEN,
    )

    assert settings.jwt_secret == PRODUCTION_JWT_SECRET


def test_production_rejects_placeholder_telegram_bot_token() -> None:
    with pytest.raises(ValueError):
        Settings(
            APP_ENV="production",
            JWT_SECRET=PRODUCTION_JWT_SECRET,
            TELEGRAM_BOT_TOKEN="replace_me",
        )


def test_production_rejects_empty_telegram_bot_token() -> None:
    with pytest.raises(ValueError):
        Settings(
            APP_ENV="production",
            JWT_SECRET=PRODUCTION_JWT_SECRET,
            TELEGRAM_BOT_TOKEN="",
        )


def test_production_rejects_short_telegram_bot_token() -> None:
    with pytest.raises(ValueError):
        Settings(
            APP_ENV="production",
            JWT_SECRET=PRODUCTION_JWT_SECRET,
            TELEGRAM_BOT_TOKEN="short",
        )


def test_production_accepts_configured_telegram_bot_token_with_configured_jwt_secret() -> None:
    settings = Settings(
        APP_ENV="production",
        JWT_SECRET=PRODUCTION_JWT_SECRET,
        TELEGRAM_BOT_TOKEN=PRODUCTION_TELEGRAM_BOT_TOKEN,
    )

    assert settings.telegram_bot_token == PRODUCTION_TELEGRAM_BOT_TOKEN
