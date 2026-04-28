from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ...db.session import get_db
from ...models import Asset, HalalAssessment, Instrument
from ...modules.halal.check import DEFAULT_METHODOLOGY, combine_statuses
from ...modules.risk.calculator import RiskCalculationInput, RiskCalculationOutput, calculate_risk
from ...schemas.halal import HalalStatus
from ...schemas.risk import RiskCalculationRequest, RiskCalculatorResponse

router = APIRouter(prefix="/api/v1/risk", tags=["risk"])


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


def _to_float(value: Decimal | None) -> float | None:
    return float(value) if value is not None else None


def _to_response(output: RiskCalculationOutput) -> RiskCalculatorResponse:
    return RiskCalculatorResponse(
        deposit=float(output.deposit),
        entry_price=float(output.entry_price),
        stop_loss=float(output.stop_loss),
        take_profit=_to_float(output.take_profit),
        risk_percent=float(output.risk_percent),
        risk_amount=float(output.risk_amount),
        max_loss=float(output.max_loss),
        stop_distance=float(output.stop_distance),
        position_size=float(output.position_size),
        risk_reward=_to_float(output.risk_reward),
        verdict=output.verdict,
        reasons=output.reasons,
        halal_combined_status=output.halal_combined_status,
        instrument_status=output.instrument_status,
        educational_disclaimer=output.educational_disclaimer,
    )


def _risk_input(
    payload: RiskCalculationRequest,
    *,
    halal_combined_status: str | None = None,
    instrument_status: str | None = None,
    context_invalid_reasons: list[str] | None = None,
) -> RiskCalculationInput:
    return RiskCalculationInput(
        deposit=payload.deposit,
        entry_price=payload.entry_price,
        stop_loss=payload.stop_loss,
        take_profit=payload.take_profit,
        risk_percent=payload.risk_percent,
        halal_combined_status=halal_combined_status,
        instrument_status=instrument_status,
        context_invalid_reasons=context_invalid_reasons or [],
    )


@router.post("/calculate", response_model=RiskCalculatorResponse)
def calculate_risk_endpoint(
    payload: RiskCalculationRequest,
    db: Session = Depends(get_db),
) -> RiskCalculatorResponse:
    if payload.methodology != DEFAULT_METHODOLOGY:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported methodology")

    has_asset = payload.asset_id is not None
    has_instrument = payload.instrument_id is not None
    if has_asset != has_instrument:
        output = calculate_risk(
            _risk_input(
                payload,
                context_invalid_reasons=[
                    "Asset and instrument must be provided together for screening.",
                ],
            )
        )
        return _to_response(output)

    if not has_asset and not has_instrument:
        return _to_response(calculate_risk(_risk_input(payload)))

    asset = _get_public_asset(db, str(payload.asset_id))
    if asset is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")

    instrument = _get_instrument(db, str(payload.instrument_id))
    if instrument is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Instrument not found")

    assessment = _get_current_assessment(db, asset.id, payload.methodology)
    asset_status = HalalStatus(assessment.asset_status) if assessment else HalalStatus.INSUFFICIENT_DATA
    combined = combine_statuses(asset_status, instrument)

    output = calculate_risk(
        _risk_input(
            payload,
            halal_combined_status=combined.combined_status.value,
            instrument_status=combined.instrument_status.value,
        )
    )
    return _to_response(output)
