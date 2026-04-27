from datetime import datetime

from .common import Confidence, DataFreshnessStatus, DataQualityStatus, OrmSchema
from .halal import HalalStatus


class AssetSearchItem(OrmSchema):
    id: str
    symbol: str
    name: str
    asset_type: str
    exchange: str | None = None
    sector: str | None = None
    country: str | None = None
    currency: str | None = None
    current_status: HalalStatus | None = None
    confidence: Confidence | None = None
    data_freshness_status: DataFreshnessStatus | None = None


class AssetAssessmentSummary(OrmSchema):
    methodology: str
    asset_status: HalalStatus
    summary: str
    source_name: str
    source_url: str | None = None
    data_quality_status: DataQualityStatus
    data_freshness_status: DataFreshnessStatus
    confidence: Confidence
    reviewed_at: datetime | None = None
    next_review_at: datetime | None = None


class AssetDetail(OrmSchema):
    id: str
    symbol: str
    name: str
    asset_type: str
    exchange: str | None = None
    sector: str | None = None
    country: str | None = None
    currency: str | None = None
    is_active: bool
    is_public: bool
    latest_assessment: AssetAssessmentSummary | None = None
