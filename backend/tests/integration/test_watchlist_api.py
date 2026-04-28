from datetime import UTC, datetime

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.core.config import settings
from backend.app.db.base import Base
from backend.app.db.session import get_db
from backend.app.main import app
from backend.app.models import Asset, User, WatchlistItem
from backend.app.modules.auth.telegram_auth import issue_access_token
from backend.scripts.seed import run_seed


JWT_SECRET = "test-jwt-secret-with-enough-length"
UNKNOWN_UUID = "00000000-0000-0000-0000-000000000000"


@pytest.fixture()
def watchlist_client(monkeypatch: pytest.MonkeyPatch):
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
        run_seed(db)
        user_one = User(telegram_id_hash="watchlist-user-one", username="one", locale="en")
        user_two = User(telegram_id_hash="watchlist-user-two", username="two", locale="en")
        db.add_all([user_one, user_two])
        db.commit()
        db.refresh(user_one)
        db.refresh(user_two)
        token_one, _ = issue_access_token(user_one)
        token_two, _ = issue_access_token(user_two)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield (
            test_client,
            TestingSessionLocal,
            {"Authorization": f"Bearer {token_one}"},
            {"Authorization": f"Bearer {token_two}"},
        )
    app.dependency_overrides.clear()


def asset_id_for(TestingSessionLocal, symbol: str) -> str:
    with TestingSessionLocal() as db:
        asset = db.scalar(select(Asset).where(Asset.symbol == symbol))

    return asset.id


def test_watchlist_auth_required(watchlist_client) -> None:
    client, _, _, _ = watchlist_client

    get_response = client.get("/api/v1/watchlist")
    post_response = client.post("/api/v1/watchlist", json={"asset_id": UNKNOWN_UUID})
    delete_response = client.delete(f"/api/v1/watchlist/{UNKNOWN_UUID}")

    assert get_response.status_code == 401
    assert post_response.status_code == 401
    assert delete_response.status_code == 401


def test_watchlist_starts_empty(watchlist_client) -> None:
    client, _, headers, _ = watchlist_client

    response = client.get("/api/v1/watchlist", headers=headers)

    assert response.status_code == 200
    assert response.json() == []


def test_add_asset_works(watchlist_client) -> None:
    client, TestingSessionLocal, headers, _ = watchlist_client
    btc_id = asset_id_for(TestingSessionLocal, "BTC")

    response = client.post("/api/v1/watchlist", headers=headers, json={"asset_id": btc_id})

    assert response.status_code == 201
    body = response.json()
    assert body["watchlist_item_id"]
    assert body["asset_id"] == btc_id
    assert body["symbol"] == "BTC"
    assert body["name"] == "Bitcoin"
    assert body["asset_type"] == "crypto"
    assert body["exchange"] == "crypto"
    assert body["currency"] == "USD"
    assert body["current_status"] == "SCHOLARLY_DISAGREEMENT"
    assert body["confidence"] == "LOW"
    assert body["data_freshness_status"] == "MISSING"
    assert "price" not in body
    assert "signal" not in body


def test_duplicate_asset_blocked(watchlist_client) -> None:
    client, TestingSessionLocal, headers, _ = watchlist_client
    btc_id = asset_id_for(TestingSessionLocal, "BTC")

    first_response = client.post("/api/v1/watchlist", headers=headers, json={"asset_id": btc_id})
    second_response = client.post("/api/v1/watchlist", headers=headers, json={"asset_id": btc_id})

    assert first_response.status_code == 201
    assert second_response.status_code == 409


def test_max_five_active_items_enforced(watchlist_client) -> None:
    client, TestingSessionLocal, headers, _ = watchlist_client
    symbols = ["BTC", "ETH", "USDT", "USDC", "BNB", "SOL"]
    asset_ids = [asset_id_for(TestingSessionLocal, symbol) for symbol in symbols]

    responses = [client.post("/api/v1/watchlist", headers=headers, json={"asset_id": asset_id}) for asset_id in asset_ids]

    assert [response.status_code for response in responses[:5]] == [201, 201, 201, 201, 201]
    assert responses[5].status_code == 400
    assert responses[5].json()["detail"] == "Watchlist limit reached"


def test_delete_watchlist_item_works(watchlist_client) -> None:
    client, TestingSessionLocal, headers, _ = watchlist_client
    btc_id = asset_id_for(TestingSessionLocal, "BTC")
    created = client.post("/api/v1/watchlist", headers=headers, json={"asset_id": btc_id}).json()

    delete_response = client.delete(f"/api/v1/watchlist/{created['watchlist_item_id']}", headers=headers)
    list_response = client.get("/api/v1/watchlist", headers=headers)

    assert delete_response.status_code == 204
    assert list_response.status_code == 200
    assert list_response.json() == []

    with TestingSessionLocal() as db:
        item = db.scalar(select(WatchlistItem).where(WatchlistItem.id == created["watchlist_item_id"]))
    assert item.deleted_at is not None


def test_user_cannot_delete_another_users_item(watchlist_client) -> None:
    client, TestingSessionLocal, user_one_headers, user_two_headers = watchlist_client
    btc_id = asset_id_for(TestingSessionLocal, "BTC")
    created = client.post("/api/v1/watchlist", headers=user_one_headers, json={"asset_id": btc_id}).json()

    delete_response = client.delete(f"/api/v1/watchlist/{created['watchlist_item_id']}", headers=user_two_headers)
    user_one_list = client.get("/api/v1/watchlist", headers=user_one_headers)
    user_two_list = client.get("/api/v1/watchlist", headers=user_two_headers)

    assert delete_response.status_code == 404
    assert len(user_one_list.json()) == 1
    assert user_two_list.json() == []


def test_deleted_item_can_be_added_again(watchlist_client) -> None:
    client, TestingSessionLocal, headers, _ = watchlist_client
    btc_id = asset_id_for(TestingSessionLocal, "BTC")
    created = client.post("/api/v1/watchlist", headers=headers, json={"asset_id": btc_id}).json()
    delete_response = client.delete(f"/api/v1/watchlist/{created['watchlist_item_id']}", headers=headers)

    recreated_response = client.post("/api/v1/watchlist", headers=headers, json={"asset_id": btc_id})
    list_response = client.get("/api/v1/watchlist", headers=headers)

    assert delete_response.status_code == 204
    assert recreated_response.status_code == 201
    assert recreated_response.json()["watchlist_item_id"] != created["watchlist_item_id"]
    assert len(list_response.json()) == 1

    with TestingSessionLocal() as db:
        items = db.scalars(select(WatchlistItem).where(WatchlistItem.asset_id == btc_id)).all()
    assert len(items) == 2
    assert sum(item.deleted_at is None for item in items) == 1


def test_unknown_asset_returns_404(watchlist_client) -> None:
    client, _, headers, _ = watchlist_client

    response = client.post("/api/v1/watchlist", headers=headers, json={"asset_id": UNKNOWN_UUID})

    assert response.status_code == 404


@pytest.mark.parametrize(
    "asset",
    [
        Asset(symbol="PRIVATE", name="Private Asset", asset_type="stock", is_active=True, is_public=False),
        Asset(symbol="INACTIVE", name="Inactive Asset", asset_type="stock", is_active=False, is_public=True),
        Asset(
            symbol="DELETED",
            name="Deleted Asset",
            asset_type="stock",
            is_active=True,
            is_public=True,
            deleted_at=datetime.now(tz=UTC),
        ),
    ],
)
def test_private_inactive_deleted_asset_cannot_be_added(watchlist_client, asset: Asset) -> None:
    client, TestingSessionLocal, headers, _ = watchlist_client
    with TestingSessionLocal() as db:
        db.add(asset)
        db.commit()
        db.refresh(asset)
        asset_id = asset.id

    response = client.post("/api/v1/watchlist", headers=headers, json={"asset_id": asset_id})

    assert response.status_code == 404


def test_instrument_id_is_not_accepted(watchlist_client) -> None:
    client, TestingSessionLocal, headers, _ = watchlist_client
    btc_id = asset_id_for(TestingSessionLocal, "BTC")

    response = client.post(
        "/api/v1/watchlist",
        headers=headers,
        json={"asset_id": btc_id, "instrument_id": UNKNOWN_UUID},
    )

    assert response.status_code == 422
