from enum import StrEnum

from pydantic import Field

from .common import Confidence, OrmSchema


class RiskVerdict(StrEnum):
    ALLOWED_FOR_PAPER = "ALLOWED_FOR_PAPER"
    CAUTION = "CAUTION"
    BLOCKED = "BLOCKED"
    INVALID_INPUT = "INVALID_INPUT"


class RiskCalculationResult(OrmSchema):
    verdict: RiskVerdict
    confidence: Confidence
    reasons: list[str] = Field(default_factory=list)
