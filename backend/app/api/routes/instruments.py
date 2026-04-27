from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ...db.session import get_db
from ...models import Instrument
from ...schemas.common import InstrumentSummary

router = APIRouter(prefix="/api/v1/instruments", tags=["instruments"])


@router.get("", response_model=list[InstrumentSummary])
def list_instruments(db: Session = Depends(get_db)) -> list[InstrumentSummary]:
    instruments = db.scalars(
        select(Instrument)
        .where(Instrument.deleted_at.is_(None))
        .order_by(Instrument.category, Instrument.code)
    ).all()

    return [InstrumentSummary.model_validate(instrument) for instrument in instruments]
