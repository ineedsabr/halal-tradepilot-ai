from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict


class OrmSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class EntityReadMixin(OrmSchema):
    id: str
    created_at: datetime
    updated_at: datetime


class SoftDeleteReadMixin(EntityReadMixin):
    deleted_at: datetime | None = None


class DataQualityStatus(StrEnum):
    VERIFIED = "VERIFIED"
    ESTIMATED = "ESTIMATED"
    STALE = "STALE"
    CONFLICTING = "CONFLICTING"
    MISSING = "MISSING"
    MANUAL_REVIEW_REQUIRED = "MANUAL_REVIEW_REQUIRED"


class DataFreshnessStatus(StrEnum):
    FRESH = "FRESH"
    ACCEPTABLE = "ACCEPTABLE"
    STALE = "STALE"
    MISSING = "MISSING"


class Confidence(StrEnum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class Language(StrEnum):
    RU = "ru"
    EN = "en"
    DE = "de"


class Theme(StrEnum):
    LIGHT = "light"
    DARK = "dark"
    TELEGRAM = "telegram"


class UserLevel(StrEnum):
    LEARNER = "learner"
    TRADER = "trader"
    PRO = "pro"


class RiskProfile(StrEnum):
    CONSERVATIVE = "conservative"
    MODERATE = "moderate"
    ACTIVE = "active"


class AssetSummary(OrmSchema):
    id: str
    symbol: str
    name: str
    asset_type: str
    data_quality: DataQualityStatus | None = None
    data_freshness: DataFreshnessStatus | None = None
