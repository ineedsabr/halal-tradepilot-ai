from datetime import datetime
from uuid import UUID

from pydantic import ConfigDict

from .common import Confidence, DataFreshnessStatus, OrmSchema
from .halal import HalalStatus


class WatchlistItemCreate(OrmSchema):
    asset_id: UUID

    model_config = ConfigDict(extra="forbid")


class WatchlistItemRead(OrmSchema):
    watchlist_item_id: str
    asset_id: str
    symbol: str
    name: str
    asset_type: str
    exchange: str | None = None
    currency: str | None = None
    current_status: HalalStatus | None = None
    confidence: Confidence | None = None
    data_freshness_status: DataFreshnessStatus | None = None
    created_at: datetime
