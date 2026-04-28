import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.db.base import Base
from backend.app.db.session import get_db
from backend.app.main import app
from backend.app.models import Asset, HalalAssessment, Instrument
from backend.scripts.seed import run_seed


UNKNOWN_UUID = "00000000-0000-0000-0000-000000000000"
METHODOLOGY = "mvp_conservative_bootstrap"


@pytest.fixture()
def risk_client():
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


def base_payload(**overrides) -> dict:
    payload = {
        "deposit": 10000,
        "entry_price": 100,
        "stop_loss": 90,
        "take_profit": 120,
        "risk_percent": 0.01,
    }
    payload.update(overrides)
    return payload


def ids_for(TestingSessionLocal, *, symbol: str, instrument_code: str) -> tuple[str, str]:
    with TestingSessionLocal() as db:
        asset = db.scalar(select(Asset).where(Asset.symbol == symbol))
        instrument = db.scalar(select(Instrument).where(Instrument.code == instrument_code))
    return asset.id, instrument.id


def test_math_only_calculation_works_without_halal_verdict(risk_client) -> None:
    client, _ = risk_client

    response = client.post("/api/v1/risk/calculate", json=base_payload())

    assert response.status_code == 200
    body = response.json()
    assert body["risk_amount"] == 100
    assert body["max_loss"] == 100
    assert body["stop_distance"] == 10
    assert body["position_size"] == 10
    assert body["risk_reward"] == 2
    assert body["verdict"] == "ALLOWED"
    assert body["reasons"] == []
    assert body["halal_combined_status"] is None
    assert body["instrument_status"] is None


def test_take_profit_omitted_works(risk_client) -> None:
    client, _ = risk_client

    response = client.post("/api/v1/risk/calculate", json=base_payload(take_profit=None))

    assert response.status_code == 200
    body = response.json()
    assert body["risk_reward"] is None
    assert body["verdict"] == "ALLOWED"


def test_entry_price_equal_stop_loss_is_invalid(risk_client) -> None:
    client, _ = risk_client

    response = client.post("/api/v1/risk/calculate", json=base_payload(entry_price=100, stop_loss=100))

    assert response.status_code == 200
    body = response.json()
    assert body["verdict"] == "INVALID"
    assert "Entry price and stop loss must differ." in body["reasons"]


def test_risk_percent_above_two_percent_is_blocked(risk_client) -> None:
    client, _ = risk_client

    response = client.post("/api/v1/risk/calculate", json=base_payload(risk_percent=0.03))

    assert response.status_code == 200
    body = response.json()
    assert body["verdict"] == "BLOCKED"
    assert "Risk percent exceeds the 2% educational maximum." in body["reasons"]


def test_low_risk_reward_is_blocked(risk_client) -> None:
    client, _ = risk_client

    response = client.post("/api/v1/risk/calculate", json=base_payload(take_profit=105))

    assert response.status_code == 200
    body = response.json()
    assert body["risk_reward"] == 0.5
    assert body["verdict"] == "BLOCKED"
    assert "Target distance ratio is below 1.0." in body["reasons"]


def test_restricted_instrument_is_blocked(risk_client) -> None:
    client, TestingSessionLocal = risk_client
    asset_id, instrument_id = ids_for(TestingSessionLocal, symbol="BTC", instrument_code="FUTURES")

    response = client.post(
        "/api/v1/risk/calculate",
        json=base_payload(asset_id=asset_id, instrument_id=instrument_id),
    )

    assert response.status_code == 200
    body = response.json()
    assert body["instrument_status"] == "AVOID"
    assert body["halal_combined_status"] == "AVOID"
    assert body["verdict"] == "BLOCKED"
    assert "Selected instrument is restricted." in body["reasons"]


def test_avoid_combined_status_is_blocked(risk_client) -> None:
    client, TestingSessionLocal = risk_client
    with TestingSessionLocal() as db:
        asset = Asset(symbol="AVOIDME", name="Avoid Test Asset", asset_type="stock", is_active=True, is_public=True)
        db.add(asset)
        db.flush()
        db.add(
            HalalAssessment(
                asset_id=asset.id,
                methodology=METHODOLOGY,
                asset_status="AVOID",
                summary="Conservative test assessment.",
                source_name="Test source",
                data_quality_status="MANUAL_REVIEW_REQUIRED",
                data_freshness_status="MISSING",
                confidence="LOW",
                is_current=True,
            )
        )
        instrument = db.scalar(select(Instrument).where(Instrument.code == "SPOT_STOCK"))
        db.commit()
        asset_id = asset.id
        instrument_id = instrument.id

    response = client.post(
        "/api/v1/risk/calculate",
        json=base_payload(asset_id=asset_id, instrument_id=instrument_id),
    )

    assert response.status_code == 200
    body = response.json()
    assert body["instrument_status"] == "HALAL"
    assert body["halal_combined_status"] == "AVOID"
    assert body["verdict"] == "BLOCKED"
    assert "Asset and instrument screening blocks this combination." in body["reasons"]


def test_conservative_seed_status_returns_caution(risk_client) -> None:
    client, TestingSessionLocal = risk_client
    asset_id, instrument_id = ids_for(TestingSessionLocal, symbol="BTC", instrument_code="SPOT_CRYPTO")

    response = client.post(
        "/api/v1/risk/calculate",
        json=base_payload(asset_id=asset_id, instrument_id=instrument_id),
    )

    assert response.status_code == 200
    body = response.json()
    assert body["instrument_status"] == "HALAL"
    assert body["halal_combined_status"] == "SCHOLARLY_DISAGREEMENT"
    assert body["verdict"] == "CAUTION"


def test_unknown_asset_returns_safe_error(risk_client) -> None:
    client, TestingSessionLocal = risk_client
    _, instrument_id = ids_for(TestingSessionLocal, symbol="BTC", instrument_code="SPOT_CRYPTO")

    response = client.post(
        "/api/v1/risk/calculate",
        json=base_payload(asset_id=UNKNOWN_UUID, instrument_id=instrument_id),
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Asset not found"


def test_unknown_instrument_returns_safe_error(risk_client) -> None:
    client, TestingSessionLocal = risk_client
    asset_id, _ = ids_for(TestingSessionLocal, symbol="BTC", instrument_code="SPOT_CRYPTO")

    response = client.post(
        "/api/v1/risk/calculate",
        json=base_payload(asset_id=asset_id, instrument_id=UNKNOWN_UUID),
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Instrument not found"


def test_partial_halal_pair_does_not_fake_halal_status(risk_client) -> None:
    client, TestingSessionLocal = risk_client
    asset_id, _ = ids_for(TestingSessionLocal, symbol="BTC", instrument_code="SPOT_CRYPTO")

    response = client.post("/api/v1/risk/calculate", json=base_payload(asset_id=asset_id))

    assert response.status_code == 200
    body = response.json()
    assert body["verdict"] == "INVALID"
    assert body["halal_combined_status"] is None
    assert body["instrument_status"] is None
    assert "Asset and instrument must be provided together for screening." in body["reasons"]


def test_no_advice_or_signal_wording_in_response_text(risk_client) -> None:
    client, _ = risk_client

    response = client.post("/api/v1/risk/calculate", json=base_payload(risk_percent=0.03))

    assert response.status_code == 200
    body = response.json()
    response_text = " ".join([*body["reasons"], body["educational_disclaimer"]]).lower()
    for forbidden in ("buy", "sell", "profit", "signal"):
        assert forbidden not in response_text
