import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.db.session import SessionLocal
from backend.app.models import Asset, HalalAssessment, Instrument


SEED_DIR = Path(__file__).resolve().parents[1] / "app" / "db" / "seed"


@dataclass(frozen=True)
class SeedCounts:
    instruments_created: int = 0
    instruments_updated: int = 0
    assets_created: int = 0
    assets_updated: int = 0
    assessments_created: int = 0
    assessments_updated: int = 0


def load_seed_json(filename: str) -> list[dict[str, Any]]:
    with (SEED_DIR / filename).open(encoding="utf-8") as file:
        data = json.load(file)

    if not isinstance(data, list):
        raise ValueError(f"{filename} must contain a JSON list")
    return data


def _seed_instruments(db: Session) -> tuple[int, int]:
    created = 0
    updated = 0

    for item in load_seed_json("instruments_seed.json"):
        values = {
            "code": item["code"],
            "name": item["name"],
            "category": item["category"],
            "is_absolute_restriction": item["is_absolute_restriction"],
            "restriction_reason": item.get("restriction_reason"),
        }
        instrument = db.scalar(select(Instrument).where(Instrument.code == item["code"]))
        if instrument is None:
            db.add(Instrument(**values))
            created += 1

    return created, updated


def _seed_assets(db: Session) -> tuple[int, int]:
    created = 0
    updated = 0

    for item in load_seed_json("assets_seed.json"):
        values = {
            "symbol": item["symbol"],
            "name": item["name"],
            "asset_type": item["asset_type"],
            "exchange": item["exchange"],
            "sector": item["sector"],
            "country": item["country"],
            "currency": item["currency"],
            "is_active": item["is_active"],
            "is_public": item["is_public"],
        }
        asset = db.scalar(select(Asset).where(Asset.symbol == item["symbol"]))
        if asset is None:
            db.add(Asset(**values))
            created += 1

    return created, updated


def _seed_halal_assessments(db: Session) -> tuple[int, int]:
    created = 0
    updated = 0

    assets_by_symbol = {asset.symbol: asset for asset in db.scalars(select(Asset)).all()}
    for item in load_seed_json("halal_assessments_seed.json"):
        asset = assets_by_symbol.get(item["asset_symbol"])
        if asset is None:
            raise ValueError(f"Unknown asset symbol in halal assessment seed: {item['asset_symbol']}")

        values = {
            "asset_id": asset.id,
            "methodology": item["methodology"],
            "asset_status": item["asset_status"],
            "summary": item["summary"],
            "source_name": item["source_name"],
            "source_url": item.get("source_url"),
            "data_quality_status": item["data_quality_status"],
            "data_freshness_status": item["data_freshness_status"],
            "confidence": item["confidence"],
            "is_current": item["is_current"],
        }
        assessment = db.scalar(
            select(HalalAssessment).where(
                HalalAssessment.asset_id == asset.id,
                HalalAssessment.methodology == item["methodology"],
                HalalAssessment.is_current.is_(item["is_current"]),
            )
        )
        if assessment is None:
            db.add(HalalAssessment(**values))
            created += 1

    return created, updated


def run_seed(db: Session) -> SeedCounts:
    """Create missing conservative bootstrap records without mutating existing rows."""
    instruments_created, instruments_updated = _seed_instruments(db)
    assets_created, assets_updated = _seed_assets(db)

    # Assessments reference generated asset IDs, so pending assets must be flushed first.
    db.flush()
    assessments_created, assessments_updated = _seed_halal_assessments(db)

    return SeedCounts(
        instruments_created=instruments_created,
        instruments_updated=instruments_updated,
        assets_created=assets_created,
        assets_updated=assets_updated,
        assessments_created=assessments_created,
        assessments_updated=assessments_updated,
    )


def main() -> None:
    with SessionLocal() as db:
        counts = run_seed(db)
        db.commit()

    print(
        "Seed complete: "
        f"instruments created={counts.instruments_created} updated={counts.instruments_updated}; "
        f"assets created={counts.assets_created} updated={counts.assets_updated}; "
        f"assessments created={counts.assessments_created} updated={counts.assessments_updated}"
    )


if __name__ == "__main__":
    main()
