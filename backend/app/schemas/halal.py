from enum import StrEnum
from datetime import datetime

from .common import (
    AssetSummary,
    Confidence,
    DataFreshnessStatus,
    DataQualityStatus,
    InstrumentSummary,
    OrmSchema,
    SoftDeleteReadMixin,
)


class HalalStatus(StrEnum):
    HALAL = "HALAL"
    DOUBTFUL = "DOUBTFUL"
    AVOID = "AVOID"
    UNDER_REVIEW = "UNDER_REVIEW"
    INSUFFICIENT_DATA = "INSUFFICIENT_DATA"
    SCHOLARLY_DISAGREEMENT = "SCHOLARLY_DISAGREEMENT"
    SOURCE_CONFLICT = "SOURCE_CONFLICT"


class HalalAssessmentBase(OrmSchema):
    asset_id: str
    methodology: str
    asset_status: HalalStatus
    business_screen_status: HalalStatus | None = None
    financial_screen_status: HalalStatus | None = None
    crypto_screen_status: HalalStatus | None = None
    summary: str
    detailed_reason: str | None = None
    source_name: str
    source_url: str | None = None
    source_date: datetime | None = None
    data_quality_status: DataQualityStatus
    data_freshness_status: DataFreshnessStatus
    confidence: Confidence
    reviewed_by_admin_id: str | None = None
    reviewed_at: datetime | None = None
    next_review_at: datetime | None = None
    is_current: bool


class HalalAssessmentRead(HalalAssessmentBase, SoftDeleteReadMixin):
    pass


class HalalCheckResult(OrmSchema):
    asset: AssetSummary
    instrument: InstrumentSummary
    asset_status: HalalStatus
    instrument_status: HalalStatus
    combined_status: HalalStatus
    methodology: str
    confidence: Confidence
    data_quality_status: DataQualityStatus
    data_freshness_status: DataFreshnessStatus
    last_reviewed_at: datetime | None = None
    next_review_at: datetime | None = None
    summary: str
    blocking_reason: str | None = None
    disclaimer: str
