from enum import StrEnum
from decimal import Decimal
from uuid import UUID

from pydantic import ConfigDict

from .common import OrmSchema


class RiskVerdict(StrEnum):
    ALLOWED_FOR_PAPER = "ALLOWED_FOR_PAPER"
    CAUTION = "CAUTION"
    BLOCKED = "BLOCKED"
    INVALID_INPUT = "INVALID_INPUT"


class RiskCalculatorVerdict(StrEnum):
    ALLOWED = "ALLOWED"
    CAUTION = "CAUTION"
    BLOCKED = "BLOCKED"
    INVALID = "INVALID"


class RiskCalculationRequest(OrmSchema):
    deposit: Decimal
    entry_price: Decimal
    stop_loss: Decimal
    take_profit: Decimal | None = None
    risk_percent: Decimal
    asset_id: UUID | None = None
    instrument_id: UUID | None = None
    methodology: str = "mvp_conservative_bootstrap"

    model_config = ConfigDict(extra="forbid")


class RiskCalculatorResponse(OrmSchema):
    deposit: float
    entry_price: float
    stop_loss: float
    take_profit: float | None = None
    risk_percent: float
    risk_amount: float
    max_loss: float
    stop_distance: float
    position_size: float
    risk_reward: float | None = None
    verdict: RiskCalculatorVerdict
    reasons: list[str]
    halal_combined_status: str | None = None
    instrument_status: str | None = None
    educational_disclaimer: str


class RiskCalculationResult(OrmSchema):
    position_size: Decimal
    max_loss: Decimal
    risk_reward: Decimal | None = None
    verdict: RiskVerdict
    blocked_reason: str | None = None
    caution_reason: str | None = None
    explanation: str
