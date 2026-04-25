from enum import StrEnum
from decimal import Decimal

from .common import OrmSchema


class RiskVerdict(StrEnum):
    ALLOWED_FOR_PAPER = "ALLOWED_FOR_PAPER"
    CAUTION = "CAUTION"
    BLOCKED = "BLOCKED"
    INVALID_INPUT = "INVALID_INPUT"


class RiskCalculationResult(OrmSchema):
    position_size: Decimal
    max_loss: Decimal
    risk_reward: Decimal | None = None
    verdict: RiskVerdict
    blocked_reason: str | None = None
    caution_reason: str | None = None
    explanation: str
