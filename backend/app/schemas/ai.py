from decimal import Decimal
from enum import StrEnum

from pydantic import Field

from .common import OrmSchema


class AIValidationStatus(StrEnum):
    VALID = "VALID"
    INVALID_SCHEMA = "INVALID_SCHEMA"
    INVALID_SEMANTIC = "INVALID_SEMANTIC"
    BLOCKED_SAFETY = "BLOCKED_SAFETY"
    PROVIDER_ERROR = "PROVIDER_ERROR"
    TIMEOUT = "TIMEOUT"


class AIOutputLogBase(OrmSchema):
    subject_ref_hash: str | None = None
    feature: str
    purpose: str | None = None
    input_hash: str | None = None
    prompt_hash: str | None = None
    output_json: dict | None = None
    validation_status: AIValidationStatus
    failure_reason: str | None = None
    provider: str | None = None
    model_name: str | None = None
    input_tokens: int | None = None
    output_tokens: int | None = None
    cost_estimate: Decimal | None = None


class AIGuardResponse(OrmSchema):
    status: AIValidationStatus
    reasons: list[str] = Field(default_factory=list)
