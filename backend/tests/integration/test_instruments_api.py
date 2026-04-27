from datetime import UTC, datetime

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.db.base import Base
from backend.app.db.session import get_db
from backend.app.main import app
from backend.app.models import Instrument
from backend.scripts.seed import run_seed


INSTRUMENT_CODES = {
    "SPOT_STOCK",
    "SPOT_CRYPTO",
    "ETF",
    "CFD",
    "FUTURES",
    "OPTIONS",
    "PERPETUALS",
    "MARGIN",
    "SHORT_SELLING",
    "LEVERAGED_TOKEN",
    "STAKING",
    "EARN_LENDING",
}
RESTRICTED_CODES = {
    "CFD",
    "FUTURES",
    "OPTIONS",
    "PERPETUALS",
    "MARGIN",
    "SHORT_SELLING",
    "LEVERAGED_TOKEN",
    "EARN_LENDING",
}


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


def test_list_instruments_returns_seeded_options(seeded_client) -> None:
    client, _ = seeded_client

    response = client.get("/api/v1/instruments")

    assert response.status_code == 200
    body = response.json()
    codes = {item["code"] for item in body}
    assert codes == INSTRUMENT_CODES


def test_list_instruments_response_shape_and_restrictions(seeded_client) -> None:
    client, _ = seeded_client

    response = client.get("/api/v1/instruments")

    assert response.status_code == 200
    body = response.json()
    by_code = {item["code"]: item for item in body}
    assert len(by_code) == len(body)

    for item in body:
        assert set(item) == {
            "id",
            "code",
            "name",
            "category",
            "is_absolute_restriction",
            "restriction_reason",
        }
        assert item["id"]
        assert item["name"]
        assert item["category"]

    for code in RESTRICTED_CODES:
        assert by_code[code]["is_absolute_restriction"] is True
        assert by_code[code]["restriction_reason"]

    assert by_code["SPOT_STOCK"]["is_absolute_restriction"] is False
    assert by_code["SPOT_CRYPTO"]["is_absolute_restriction"] is False


def test_list_instruments_excludes_soft_deleted_options(seeded_client) -> None:
    client, TestingSessionLocal = seeded_client
    with TestingSessionLocal() as db:
        instrument = db.scalar(select(Instrument).where(Instrument.code == "CFD"))
        instrument.deleted_at = datetime.now(tz=UTC)
        db.commit()

    response = client.get("/api/v1/instruments")

    assert response.status_code == 200
    codes = {item["code"] for item in response.json()}
    assert "CFD" not in codes
