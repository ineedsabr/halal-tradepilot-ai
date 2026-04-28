import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.core.config import settings
from backend.app.db.base import Base
from backend.app.db.session import get_db
from backend.app.main import app
from backend.app.models import User
from backend.app.modules.auth.telegram_auth import issue_access_token


JWT_SECRET = "test-jwt-secret-with-enough-length"


@pytest.fixture()
def authenticated_client(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr(settings, "jwt_secret", JWT_SECRET)
    monkeypatch.setattr(settings, "jwt_expires_minutes", 30)

    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    with TestingSessionLocal() as db:
        user = User(telegram_id_hash="test-telegram-id-hash", username="alice", locale="en")
        db.add(user)
        db.commit()
        db.refresh(user)
        access_token, _ = issue_access_token(user)
        user_id = user.id

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client, {"Authorization": f"Bearer {access_token}"}, user_id
    app.dependency_overrides.clear()


def test_settings_auth_required(authenticated_client) -> None:
    client, _, _ = authenticated_client

    get_response = client.get("/api/v1/me/settings")
    put_response = client.put("/api/v1/me/settings", json={"language": "ru"})

    assert get_response.status_code == 401
    assert put_response.status_code == 401


def test_get_default_settings(authenticated_client) -> None:
    client, headers, _ = authenticated_client

    response = client.get("/api/v1/me/settings", headers=headers)

    assert response.status_code == 200
    body = response.json()
    assert body == {
        "language": "en",
        "theme": "telegram",
        "level": "learner",
        "goal": "learn",
        "methodology": "conservative",
        "risk_profile": "conservative",
        "max_risk_per_trade": 0.005,
        "demo_deposit": 10000,
        "notifications_enabled": True,
        "disclaimer_accepted_at": None,
        "terms_accepted_at": None,
        "privacy_accepted_at": None,
        "onboarding_completed": False,
    }


def test_update_settings(authenticated_client) -> None:
    client, headers, _ = authenticated_client

    response = client.put(
        "/api/v1/me/settings",
        headers=headers,
        json={
            "language": "ru",
            "theme": "dark",
            "level": "trader",
            "goal": "invest",
            "methodology": "balanced",
            "risk_profile": "moderate",
            "demo_deposit": 25000,
            "notifications_enabled": False,
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["language"] == "ru"
    assert body["theme"] == "dark"
    assert body["level"] == "trader"
    assert body["goal"] == "invest"
    assert body["methodology"] == "balanced"
    assert body["risk_profile"] == "moderate"
    assert body["max_risk_per_trade"] == 0.01
    assert body["demo_deposit"] == 25000
    assert body["notifications_enabled"] is False
    assert body["onboarding_completed"] is False


@pytest.mark.parametrize(
    "payload",
    [
        {"language": "fr"},
        {"theme": "system"},
        {"level": "expert"},
        {"goal": "gamble"},
        {"methodology": "unknown"},
        {"risk_profile": "aggressive"},
    ],
)
def test_invalid_enums_rejected(authenticated_client, payload: dict[str, str]) -> None:
    client, headers, _ = authenticated_client

    response = client.put("/api/v1/me/settings", headers=headers, json=payload)

    assert response.status_code == 422


@pytest.mark.parametrize("demo_deposit", [99, 10_000_001, "not-a-number"])
def test_invalid_demo_deposit_rejected(authenticated_client, demo_deposit) -> None:
    client, headers, _ = authenticated_client

    response = client.put("/api/v1/me/settings", headers=headers, json={"demo_deposit": demo_deposit})

    assert response.status_code == 422


def test_consent_timestamps_set(authenticated_client) -> None:
    client, headers, _ = authenticated_client

    response = client.put(
        "/api/v1/me/settings",
        headers=headers,
        json={
            "disclaimer_accepted": True,
            "terms_accepted": True,
            "privacy_accepted": True,
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["disclaimer_accepted_at"] is not None
    assert body["terms_accepted_at"] is not None
    assert body["privacy_accepted_at"] is not None
    assert body["onboarding_completed"] is True


def test_consent_timestamps_not_erased(authenticated_client) -> None:
    client, headers, _ = authenticated_client
    first_response = client.put(
        "/api/v1/me/settings",
        headers=headers,
        json={
            "disclaimer_accepted": True,
            "terms_accepted": True,
            "privacy_accepted": True,
        },
    )
    accepted_at = {
        "disclaimer_accepted_at": first_response.json()["disclaimer_accepted_at"],
        "terms_accepted_at": first_response.json()["terms_accepted_at"],
        "privacy_accepted_at": first_response.json()["privacy_accepted_at"],
    }

    second_response = client.put("/api/v1/me/settings", headers=headers, json={"language": "de"})

    assert second_response.status_code == 200
    body = second_response.json()
    assert body["language"] == "de"
    assert body["disclaimer_accepted_at"] == accepted_at["disclaimer_accepted_at"]
    assert body["terms_accepted_at"] == accepted_at["terms_accepted_at"]
    assert body["privacy_accepted_at"] == accepted_at["privacy_accepted_at"]
    assert body["onboarding_completed"] is True


@pytest.mark.parametrize(
    ("risk_profile", "max_risk_per_trade"),
    [
        ("conservative", 0.005),
        ("moderate", 0.01),
        ("active", 0.02),
    ],
)
def test_risk_profile_maps_max_risk_per_trade(
    authenticated_client,
    risk_profile: str,
    max_risk_per_trade: float,
) -> None:
    client, headers, _ = authenticated_client

    response = client.put("/api/v1/me/settings", headers=headers, json={"risk_profile": risk_profile})

    assert response.status_code == 200
    assert response.json()["max_risk_per_trade"] == max_risk_per_trade


def test_no_user_id_accepted_in_body(authenticated_client) -> None:
    client, headers, user_id = authenticated_client

    response = client.put(
        "/api/v1/me/settings",
        headers=headers,
        json={"user_id": user_id, "language": "ru"},
    )

    assert response.status_code == 422


def test_consent_revocation_rejected(authenticated_client) -> None:
    client, headers, _ = authenticated_client
    accepted_response = client.put(
        "/api/v1/me/settings",
        headers=headers,
        json={
            "disclaimer_accepted": True,
            "terms_accepted": True,
            "privacy_accepted": True,
        },
    )

    response = client.put("/api/v1/me/settings", headers=headers, json={"privacy_accepted": False})

    assert accepted_response.status_code == 200
    assert response.status_code == 422
