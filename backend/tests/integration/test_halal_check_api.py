import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.db.base import Base
from backend.app.db.session import get_db
from backend.app.main import app
from backend.app.models import Asset, HalalAssessment, Instrument
from backend.app.modules.halal.check import build_halal_check_result
from backend.scripts.seed import run_seed


UNKNOWN_UUID = "00000000-0000-0000-0000-000000000000"


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


def ids_for(TestingSessionLocal, *, symbol: str, instrument_code: str) -> tuple[str, str]:
    with TestingSessionLocal() as db:
        asset = db.scalar(select(Asset).where(Asset.symbol == symbol))
        instrument = db.scalar(select(Instrument).where(Instrument.code == instrument_code))
    return asset.id, instrument.id


def halal_check(client: TestClient, *, asset_id: str, instrument_id: str):
    return client.get(
        "/api/v1/halal/check",
        params={
            "asset_id": asset_id,
            "instrument_id": instrument_id,
            "methodology": "mvp_conservative_bootstrap",
        },
    )


def test_btc_spot_crypto_returns_scholarly_disagreement(seeded_client) -> None:
    client, TestingSessionLocal = seeded_client
    asset_id, instrument_id = ids_for(TestingSessionLocal, symbol="BTC", instrument_code="SPOT_CRYPTO")

    response = halal_check(client, asset_id=asset_id, instrument_id=instrument_id)

    assert response.status_code == 200
    body = response.json()
    assert body["asset"]["symbol"] == "BTC"
    assert body["instrument"]["code"] == "SPOT_CRYPTO"
    assert body["asset_status"] == "SCHOLARLY_DISAGREEMENT"
    assert body["instrument_status"] == "HALAL"
    assert body["combined_status"] == "SCHOLARLY_DISAGREEMENT"


def test_btc_futures_returns_avoid(seeded_client) -> None:
    client, TestingSessionLocal = seeded_client
    asset_id, instrument_id = ids_for(TestingSessionLocal, symbol="BTC", instrument_code="FUTURES")

    response = halal_check(client, asset_id=asset_id, instrument_id=instrument_id)

    assert response.status_code == 200
    body = response.json()
    assert body["asset_status"] == "SCHOLARLY_DISAGREEMENT"
    assert body["instrument_status"] == "AVOID"
    assert body["combined_status"] == "AVOID"
    assert body["blocking_reason"]


def test_aapl_spot_stock_is_not_halal(seeded_client) -> None:
    client, TestingSessionLocal = seeded_client
    asset_id, instrument_id = ids_for(TestingSessionLocal, symbol="AAPL", instrument_code="SPOT_STOCK")

    response = halal_check(client, asset_id=asset_id, instrument_id=instrument_id)

    assert response.status_code == 200
    assert response.json()["combined_status"] != "HALAL"


def test_aapl_cfd_returns_avoid(seeded_client) -> None:
    client, TestingSessionLocal = seeded_client
    asset_id, instrument_id = ids_for(TestingSessionLocal, symbol="AAPL", instrument_code="CFD")

    response = halal_check(client, asset_id=asset_id, instrument_id=instrument_id)

    assert response.status_code == 200
    assert response.json()["combined_status"] == "AVOID"


def test_missing_assessment_returns_insufficient_data(seeded_client) -> None:
    client, TestingSessionLocal = seeded_client
    with TestingSessionLocal() as db:
        asset = Asset(symbol="NEW", name="New Asset", asset_type="stock", is_active=True, is_public=True)
        db.add(asset)
        instrument = db.scalar(select(Instrument).where(Instrument.code == "SPOT_STOCK"))
        db.commit()
        db.refresh(asset)
        asset_id = asset.id
        instrument_id = instrument.id

    response = halal_check(client, asset_id=asset_id, instrument_id=instrument_id)

    assert response.status_code == 200
    body = response.json()
    assert body["asset_status"] == "INSUFFICIENT_DATA"
    assert body["instrument_status"] == "HALAL"
    assert body["combined_status"] == "INSUFFICIENT_DATA"
    assert body["data_quality_status"] == "MISSING"


def test_restricted_instrument_overrides_missing_assessment(seeded_client) -> None:
    client, TestingSessionLocal = seeded_client
    with TestingSessionLocal() as db:
        asset = Asset(symbol="NEW2", name="New Asset Two", asset_type="stock", is_active=True, is_public=True)
        db.add(asset)
        instrument = db.scalar(select(Instrument).where(Instrument.code == "CFD"))
        db.commit()
        db.refresh(asset)
        asset_id = asset.id
        instrument_id = instrument.id

    response = halal_check(client, asset_id=asset_id, instrument_id=instrument_id)

    assert response.status_code == 200
    body = response.json()
    assert body["asset_status"] == "INSUFFICIENT_DATA"
    assert body["instrument_status"] == "AVOID"
    assert body["combined_status"] == "AVOID"


def test_response_includes_disclaimer_and_trust_metadata(seeded_client) -> None:
    client, TestingSessionLocal = seeded_client
    asset_id, instrument_id = ids_for(TestingSessionLocal, symbol="BTC", instrument_code="SPOT_CRYPTO")

    response = halal_check(client, asset_id=asset_id, instrument_id=instrument_id)

    assert response.status_code == 200
    body = response.json()
    assert body["disclaimer"].startswith("This app does not issue fatwas.")
    assert body["methodology"] == "mvp_conservative_bootstrap"
    assert body["confidence"] == "LOW"
    assert body["data_quality_status"] == "MANUAL_REVIEW_REQUIRED"
    assert body["data_freshness_status"] == "MISSING"
    assert body["last_reviewed_at"]
    assert "summary" in body


def test_missing_asset_returns_404(seeded_client) -> None:
    client, TestingSessionLocal = seeded_client
    _, instrument_id = ids_for(TestingSessionLocal, symbol="BTC", instrument_code="SPOT_CRYPTO")

    response = halal_check(client, asset_id=UNKNOWN_UUID, instrument_id=instrument_id)

    assert response.status_code == 404


def test_missing_instrument_returns_404(seeded_client) -> None:
    client, TestingSessionLocal = seeded_client
    asset_id, _ = ids_for(TestingSessionLocal, symbol="BTC", instrument_code="SPOT_CRYPTO")

    response = halal_check(client, asset_id=asset_id, instrument_id=UNKNOWN_UUID)

    assert response.status_code == 404


def test_unsupported_methodology_returns_400(seeded_client) -> None:
    client, TestingSessionLocal = seeded_client
    asset_id, instrument_id = ids_for(TestingSessionLocal, symbol="BTC", instrument_code="SPOT_CRYPTO")

    response = client.get(
        "/api/v1/halal/check",
        params={
            "asset_id": asset_id,
            "instrument_id": instrument_id,
            "methodology": "unsupported_methodology",
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Unsupported methodology"


def test_invalid_uuid_returns_validation_error(seeded_client) -> None:
    client, TestingSessionLocal = seeded_client
    _, instrument_id = ids_for(TestingSessionLocal, symbol="BTC", instrument_code="SPOT_CRYPTO")

    response = halal_check(client, asset_id="not-a-uuid", instrument_id=instrument_id)

    assert response.status_code == 422


def test_missing_required_query_params_return_validation_error(seeded_client) -> None:
    client, TestingSessionLocal = seeded_client
    asset_id, _ = ids_for(TestingSessionLocal, symbol="BTC", instrument_code="SPOT_CRYPTO")

    response = client.get("/api/v1/halal/check", params={"asset_id": asset_id})

    assert response.status_code == 422


def test_no_current_seed_asset_with_any_instrument_returns_halal(seeded_client) -> None:
    _, TestingSessionLocal = seeded_client
    with TestingSessionLocal() as db:
        assets = db.scalars(select(Asset)).all()
        instruments = db.scalars(select(Instrument)).all()
        assessments = db.scalars(select(HalalAssessment).where(HalalAssessment.is_current.is_(True))).all()

    assessments_by_asset_id = {assessment.asset_id: assessment for assessment in assessments}
    for asset in assets:
        for instrument in instruments:
            result = build_halal_check_result(
                asset=asset,
                instrument=instrument,
                methodology="mvp_conservative_bootstrap",
                assessment=assessments_by_asset_id.get(asset.id),
            )
            assert result.combined_status != "HALAL"
