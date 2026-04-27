import json
from pathlib import Path

from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.db.base import Base
from backend.app.models import Asset, HalalAssessment, Instrument
from backend.scripts.seed import SEED_DIR, load_seed_json, run_seed


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
RESTRICTED_INSTRUMENTS = {
    "CFD",
    "FUTURES",
    "OPTIONS",
    "PERPETUALS",
    "MARGIN",
    "SHORT_SELLING",
    "LEVERAGED_TOKEN",
    "EARN_LENDING",
}
SPOT_INSTRUMENTS = {"SPOT_STOCK", "SPOT_CRYPTO"}
CRYPTO_SYMBOLS = {"BTC", "ETH", "USDT", "USDC", "BNB", "SOL", "XRP", "ADA", "DOGE", "TON"}
STOCK_SYMBOLS = {"AAPL", "MSFT", "NVDA", "TSLA", "GOOGL", "AMZN", "META", "KO", "JNJ", "PG"}
ALL_SYMBOLS = CRYPTO_SYMBOLS | STOCK_SYMBOLS


def test_seed_json_files_exist_and_parse() -> None:
    for filename in ("instruments_seed.json", "assets_seed.json", "halal_assessments_seed.json"):
        path = Path(SEED_DIR) / filename
        assert path.exists()
        with path.open(encoding="utf-8") as file:
            content = json.load(file)
        assert isinstance(content, list)
        assert content


def test_seed_json_content_is_conservative() -> None:
    instruments = load_seed_json("instruments_seed.json")
    assets = load_seed_json("assets_seed.json")
    assessments = load_seed_json("halal_assessments_seed.json")

    assert {item["code"] for item in instruments} == INSTRUMENT_CODES
    assert {item["symbol"] for item in assets} == ALL_SYMBOLS
    assert {item["asset_symbol"] for item in assessments} == ALL_SYMBOLS
    assert {item["asset_status"] for item in assessments}.issubset(
        {"DOUBTFUL", "SCHOLARLY_DISAGREEMENT", "UNDER_REVIEW"}
    )
    assert all(item["asset_status"] != "HALAL" for item in assessments)


def test_asset_model_keeps_minimal_creation_compatible() -> None:
    engine = create_engine("sqlite:///:memory:")
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    with TestingSessionLocal() as db:
        asset = Asset(symbol="TEST", name="Test Asset", asset_type="stock")
        db.add(asset)
        db.commit()
        db.refresh(asset)

    assert asset.exchange is None
    assert asset.sector is None
    assert asset.country is None
    assert asset.currency is None
    assert asset.is_active is True
    assert asset.is_public is True


def test_seed_script_is_idempotent_and_creates_required_data() -> None:
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    with TestingSessionLocal() as db:
        first = run_seed(db)
        db.commit()
        second = run_seed(db)
        db.commit()

        instruments = db.scalars(select(Instrument)).all()
        assets = db.scalars(select(Asset)).all()
        assessments = db.scalars(select(HalalAssessment)).all()

        instrument_count = db.scalar(select(func.count()).select_from(Instrument))
        asset_count = db.scalar(select(func.count()).select_from(Asset))
        assessment_count = db.scalar(select(func.count()).select_from(HalalAssessment))

    assert first.instruments_created == 12
    assert first.assets_created == 20
    assert first.assessments_created == 20
    assert second.instruments_created == 0
    assert second.instruments_updated == 0
    assert second.assets_created == 0
    assert second.assets_updated == 0
    assert second.assessments_created == 0
    assert second.assessments_updated == 0

    assert instrument_count == 12
    assert asset_count == 20
    assert assessment_count == 20

    instruments_by_code = {instrument.code: instrument for instrument in instruments}
    assert set(instruments_by_code) == INSTRUMENT_CODES
    for code in RESTRICTED_INSTRUMENTS:
        assert instruments_by_code[code].is_absolute_restriction is True
        assert instruments_by_code[code].restriction_reason
    for code in SPOT_INSTRUMENTS:
        assert instruments_by_code[code].is_absolute_restriction is False

    assets_by_id = {asset.id: asset for asset in assets}
    assert {asset.symbol for asset in assets} == ALL_SYMBOLS

    for assessment in assessments:
        asset = assets_by_id[assessment.asset_id]
        assert assessment.methodology == "mvp_conservative_bootstrap"
        assert assessment.source_name == "Internal conservative bootstrap review"
        assert assessment.confidence == "LOW"
        assert assessment.summary
        assert assessment.asset_status != "HALAL"
        if asset.symbol in STOCK_SYMBOLS:
            assert assessment.asset_status != "HALAL"
        if asset.symbol == "BTC":
            assert assessment.asset_status != "HALAL"


def test_seed_does_not_overwrite_manual_changes() -> None:
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

        instrument = db.scalar(select(Instrument).where(Instrument.code == "CFD"))
        asset = db.scalar(select(Asset).where(Asset.symbol == "BTC"))
        assessment = db.scalar(
            select(HalalAssessment).where(
                HalalAssessment.asset_id == asset.id,
                HalalAssessment.methodology == "mvp_conservative_bootstrap",
                HalalAssessment.is_current.is_(True),
            )
        )
        instrument.name = "Manually reviewed CFD label"
        asset.name = "Manually reviewed Bitcoin label"
        assessment.summary = "Manual review note"
        db.commit()

        counts = run_seed(db)
        db.commit()
        db.refresh(instrument)
        db.refresh(asset)
        db.refresh(assessment)

    assert counts.instruments_created == 0
    assert counts.instruments_updated == 0
    assert counts.assets_created == 0
    assert counts.assets_updated == 0
    assert counts.assessments_created == 0
    assert counts.assessments_updated == 0
    assert instrument.name == "Manually reviewed CFD label"
    assert asset.name == "Manually reviewed Bitcoin label"
    assert assessment.summary == "Manual review note"
