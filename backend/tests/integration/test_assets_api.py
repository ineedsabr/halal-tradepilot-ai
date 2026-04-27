import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.db.base import Base
from backend.app.db.session import get_db
from backend.app.main import app
from backend.app.models import Asset
from backend.scripts.seed import run_seed


@pytest.fixture()
def seeded_client():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    with TestingSessionLocal() as db:
        run_seed(db)
        db.commit()

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as client:
        yield client, TestingSessionLocal
    app.dependency_overrides.clear()


def test_search_btc_works(seeded_client) -> None:
    client, _ = seeded_client

    response = client.get("/api/v1/assets/search", params={"q": "BTC"})

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["symbol"] == "BTC"
    assert body[0]["current_status"] == "SCHOLARLY_DISAGREEMENT"
    assert "price" not in body[0]


def test_search_limit_max_50(seeded_client) -> None:
    client, _ = seeded_client

    accepted = client.get("/api/v1/assets/search", params={"limit": 50})
    rejected = client.get("/api/v1/assets/search", params={"limit": 51})

    assert accepted.status_code == 200
    assert rejected.status_code == 422


def test_asset_detail_works(seeded_client) -> None:
    client, TestingSessionLocal = seeded_client
    with TestingSessionLocal() as db:
        btc = db.scalar(select(Asset).where(Asset.symbol == "BTC"))

    response = client.get(f"/api/v1/assets/{btc.id}")

    assert response.status_code == 200
    body = response.json()
    assert body["symbol"] == "BTC"
    assert body["latest_assessment"]["asset_status"] == "SCHOLARLY_DISAGREEMENT"
    assert body["latest_assessment"]["confidence"] == "LOW"


def test_missing_asset_gives_404(seeded_client) -> None:
    client, _ = seeded_client

    response = client.get(f"/api/v1/assets/{UNKNOWN_UUID}")

    assert response.status_code == 404


def test_invalid_asset_id_gives_validation_error(seeded_client) -> None:
    client, _ = seeded_client

    response = client.get("/api/v1/assets/not-a-uuid")

    assert response.status_code == 422
UNKNOWN_UUID = "00000000-0000-0000-0000-000000000000"

