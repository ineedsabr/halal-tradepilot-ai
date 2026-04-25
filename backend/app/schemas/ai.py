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
    purpose: str
    prompt_hash: str | None = None
    output_text: str | None = None


class AIGuardResponse(OrmSchema):
    status: AIValidationStatus
    reasons: list[str] = Field(default_factory=list)
