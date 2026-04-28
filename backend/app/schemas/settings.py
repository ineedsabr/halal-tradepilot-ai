from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field, model_validator

from .common import Language, RiskProfile, Theme, UserLevel


class UserGoal(StrEnum):
    LEARN = "learn"
    INVEST = "invest"
    TRADE = "trade"


class MethodologyPreference(StrEnum):
    CONSERVATIVE = "conservative"
    BALANCED = "balanced"
    SCHOLAR_BASED = "scholar_based"
    CUSTOM = "custom"


class UserSettingsUpdate(BaseModel):
    language: Language | None = None
    theme: Theme | None = None
    level: UserLevel | None = None
    goal: UserGoal | None = None
    methodology: MethodologyPreference | None = None
    risk_profile: RiskProfile | None = None
    demo_deposit: int | None = Field(default=None, ge=100, le=10_000_000)
    notifications_enabled: bool | None = None
    disclaimer_accepted: bool | None = None
    terms_accepted: bool | None = None
    privacy_accepted: bool | None = None

    model_config = ConfigDict(extra="forbid")

    @model_validator(mode="after")
    def reject_consent_revocation(self) -> "UserSettingsUpdate":
        if (
            self.disclaimer_accepted is False
            or self.terms_accepted is False
            or self.privacy_accepted is False
        ):
            raise ValueError("Consent revocation is not supported through settings update")
        return self


class UserSettingsRead(BaseModel):
    language: Language
    theme: Theme
    level: UserLevel
    goal: UserGoal
    methodology: MethodologyPreference
    risk_profile: RiskProfile
    max_risk_per_trade: float
    demo_deposit: int
    notifications_enabled: bool
    disclaimer_accepted_at: datetime | None = None
    terms_accepted_at: datetime | None = None
    privacy_accepted_at: datetime | None = None
    onboarding_completed: bool
