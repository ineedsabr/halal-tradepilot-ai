from enum import StrEnum

from pydantic import Field

from .common import AssetSummary, Confidence, DataFreshnessStatus, DataQualityStatus, OrmSchema, SoftDeleteReadMixin


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
    status: HalalStatus
    methodology_version: str | None = None
    notes: str | None = None


class HalalAssessmentRead(HalalAssessmentBase, SoftDeleteReadMixin):
    pass


class HalalCheckResult(OrmSchema):
    asset: AssetSummary
    status: HalalStatus
    confidence: Confidence
    data_quality: DataQualityStatus
    data_freshness: DataFreshnessStatus
    reasons: list[str] = Field(default_factory=list)
