import pytest

from backend.app.core.config import Settings


def test_production_rejects_placeholder_jwt_secret() -> None:
    with pytest.raises(ValueError):
        Settings(APP_ENV="production", JWT_SECRET="replace_me")


def test_production_rejects_short_jwt_secret() -> None:
    with pytest.raises(ValueError):
        Settings(APP_ENV="production", JWT_SECRET="short")


def test_production_accepts_configured_jwt_secret() -> None:
    settings = Settings(APP_ENV="production", JWT_SECRET="a-production-secret-at-least-32-chars")

    assert settings.jwt_secret == "a-production-secret-at-least-32-chars"
