import hashlib
import hmac
import json
from datetime import UTC, datetime, timedelta
from urllib.parse import parse_qsl, urlencode

import jwt
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import backend.app.db.init_db as init_db_module
from backend.app.core.config import settings
from backend.app.db.base import Base
from backend.app.db.session import get_db
from backend.app.main import app
from backend.app.models import User


BOT_TOKEN = "test-bot-token"
JWT_SECRET = "test-jwt-secret-with-enough-length"


def build_init_data(
    user_id: int | None = 123456,
    auth_date: datetime | None = None,
    username: str = "alice",
    auth_date_value: str | None = None,
    user_payload: dict | None = None,
    raw_user_payload: str | None = None,
) -> str:
    auth_datetime = auth_date or datetime.now(tz=UTC)
    if raw_user_payload is not None:
        user_data = raw_user_payload
    else:
        user_payload = user_payload or {
            "id": user_id,
            "username": username,
            "language_code": "en",
        }
        user_data = json.dumps(user_payload, separators=(",", ":"))

    payload = {
        "auth_date": auth_date_value or str(int(auth_datetime.timestamp())),
        "query_id": "test-query-id",
        "user": user_data,
    }
    data_check_string = "\n".join(f"{key}={value}" for key, value in sorted(payload.items()))
    secret_key = hmac.new(b"WebAppData", BOT_TOKEN.encode(), hashlib.sha256).digest()
    payload["hash"] = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
    return urlencode(payload)


def remove_param(init_data: str, param_name: str) -> str:
    return urlencode([(key, value) for key, value in parse_qsl(init_data) if key != param_name])


@pytest.fixture()
def client(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr(settings, "telegram_bot_token", BOT_TOKEN)
    monkeypatch.setattr(settings, "jwt_secret", JWT_SECRET)
    monkeypatch.setattr(settings, "jwt_expires_minutes", 30)

    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    monkeypatch.setattr(init_db_module, "engine", engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client, TestingSessionLocal
    app.dependency_overrides.clear()


def test_telegram_auth_accepts_valid_init_data(client) -> None:
    test_client, TestingSessionLocal = client

    response = test_client.post("/auth/telegram", json={"init_data": build_init_data()})

    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["expires_in"] == 1800
    decoded_token = jwt.decode(body["access_token"], JWT_SECRET, algorithms=["HS256"])
    assert decoded_token["sub"]

    with TestingSessionLocal() as db:
        users = db.scalars(select(User)).all()

    assert len(users) == 1
    assert users[0].telegram_id_hash
    assert users[0].username == "alice"
    assert users[0].locale == "en"


def test_telegram_auth_rejects_invalid_init_data(client) -> None:
    test_client, _ = client
    invalid_init_data = build_init_data().replace("alice", "mallory")

    response = test_client.post("/auth/telegram", json={"init_data": invalid_init_data})

    assert response.status_code == 401


def test_telegram_auth_rejects_missing_hash(client) -> None:
    test_client, _ = client

    response = test_client.post("/auth/telegram", json={"init_data": remove_param(build_init_data(), "hash")})

    assert response.status_code == 401


def test_telegram_auth_rejects_missing_auth_date(client) -> None:
    test_client, _ = client

    response = test_client.post("/auth/telegram", json={"init_data": remove_param(build_init_data(), "auth_date")})

    assert response.status_code == 401


def test_telegram_auth_rejects_malformed_auth_date(client) -> None:
    test_client, _ = client

    response = test_client.post("/auth/telegram", json={"init_data": build_init_data(auth_date_value="not-a-timestamp")})

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid Telegram auth date"


def test_telegram_auth_rejects_expired_init_data(client) -> None:
    test_client, _ = client
    expired_auth_date = datetime.now(tz=UTC) - timedelta(hours=25)

    response = test_client.post(
        "/auth/telegram",
        json={"init_data": build_init_data(auth_date=expired_auth_date)},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Telegram session expired"


def test_telegram_auth_rejects_malformed_user_json(client) -> None:
    test_client, _ = client

    response = test_client.post("/auth/telegram", json={"init_data": build_init_data(raw_user_payload="{bad-json")})

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid Telegram user payload"


def test_telegram_auth_rejects_missing_user_id(client) -> None:
    test_client, _ = client

    response = test_client.post(
        "/auth/telegram",
        json={"init_data": build_init_data(user_payload={"username": "alice", "language_code": "en"})},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid Telegram user payload"


def test_telegram_auth_updates_existing_user(client) -> None:
    test_client, TestingSessionLocal = client

    first_response = test_client.post("/auth/telegram", json={"init_data": build_init_data(username="alice")})
    second_response = test_client.post("/auth/telegram", json={"init_data": build_init_data(username="bob")})

    assert first_response.status_code == 200
    assert second_response.status_code == 200

    with TestingSessionLocal() as db:
        users = db.scalars(select(User)).all()

    assert len(users) == 1
    assert users[0].username == "bob"
