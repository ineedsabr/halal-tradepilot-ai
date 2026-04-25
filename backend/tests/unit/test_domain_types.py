from backend.app.schemas.ai import AIValidationStatus
from backend.app.schemas.common import (
    Confidence,
    DataFreshnessStatus,
    DataQualityStatus,
    Language,
    RiskProfile,
    Theme,
    UserLevel,
)
from backend.app.schemas.halal import HalalStatus
from backend.app.schemas.paper import PaperTradeStatus
from backend.app.schemas.risk import RiskVerdict


def enum_values(enum_type: type) -> list[str]:
    return [item.value for item in enum_type]


def test_shared_domain_status_values() -> None:
    assert enum_values(HalalStatus) == [
        "HALAL",
        "DOUBTFUL",
        "AVOID",
        "UNDER_REVIEW",
        "INSUFFICIENT_DATA",
        "SCHOLARLY_DISAGREEMENT",
        "SOURCE_CONFLICT",
    ]
    assert enum_values(DataQualityStatus) == [
        "VERIFIED",
        "ESTIMATED",
        "STALE",
        "CONFLICTING",
        "MISSING",
        "MANUAL_REVIEW_REQUIRED",
    ]
    assert enum_values(DataFreshnessStatus) == ["FRESH", "ACCEPTABLE", "STALE", "MISSING"]
    assert enum_values(Confidence) == ["LOW", "MEDIUM", "HIGH"]
    assert enum_values(RiskVerdict) == ["ALLOWED_FOR_PAPER", "CAUTION", "BLOCKED", "INVALID_INPUT"]
    assert enum_values(PaperTradeStatus) == ["OPEN", "CLOSED", "CANCELLED"]
    assert enum_values(AIValidationStatus) == [
        "VALID",
        "INVALID_SCHEMA",
        "INVALID_SEMANTIC",
        "BLOCKED_SAFETY",
        "PROVIDER_ERROR",
        "TIMEOUT",
    ]
    assert enum_values(Language) == ["ru", "en", "de"]
    assert enum_values(Theme) == ["light", "dark", "telegram"]
    assert enum_values(UserLevel) == ["learner", "trader", "pro"]
    assert enum_values(RiskProfile) == ["conservative", "moderate", "active"]
