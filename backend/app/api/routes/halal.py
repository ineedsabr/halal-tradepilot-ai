from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ...db.session import get_db
from ...models import Asset, HalalAssessment, Instrument
from ...modules.halal.check import DEFAULT_METHODOLOGY, build_halal_check_result
from ...schemas.halal import HalalCheckResult

router = APIRouter(prefix="/api/v1/halal", tags=["halal"])


def _get_public_asset(db: Session, asset_id: str) -> Asset | None:
    return db.scalar(
        select(Asset).where(
            Asset.id == asset_id,
            Asset.is_active.is_(True),
            Asset.is_public.is_(True),
            Asset.deleted_at.is_(None),
        )
    )


def _get_instrument(db: Session, instrument_id: str) -> Instrument | None:
    return db.scalar(
        select(Instrument).where(
            Instrument.id == instrument_id,
            Instrument.deleted_at.is_(None),
        )
    )


def _get_current_assessment(db: Session, asset_id: str, methodology: str) -> HalalAssessment | None:
    return db.scalar(
        select(HalalAssessment)
        .where(
            HalalAssessment.asset_id == asset_id,
            HalalAssessment.methodology == methodology,
            HalalAssessment.is_current.is_(True),
            HalalAssessment.deleted_at.is_(None),
        )
        .order_by(HalalAssessment.created_at.desc())
        .limit(1)
    )


@router.get("/check", response_model=HalalCheckResult)
def check_halal(
    asset_id: UUID,
    instrument_id: UUID,
    methodology: str = Query(default=DEFAULT_METHODOLOGY),
    db: Session = Depends(get_db),
) -> HalalCheckResult:
    if methodology != DEFAULT_METHODOLOGY:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported methodology")

    asset = _get_public_asset(db, str(asset_id))
    if asset is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")

    instrument = _get_instrument(db, str(instrument_id))
    if instrument is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Instrument not found")

    assessment = _get_current_assessment(db, asset.id, methodology)
    return build_halal_check_result(
        asset=asset,
        instrument=instrument,
        methodology=methodology,
        assessment=assessment,
    )
