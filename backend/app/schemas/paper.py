from datetime import datetime
from decimal import Decimal
from enum import StrEnum

from .common import OrmSchema, SoftDeleteReadMixin


class PaperTradeStatus(StrEnum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"
    CANCELLED = "CANCELLED"


class PaperTradeBase(OrmSchema):
    user_id: str
    asset_id: str
    instrument_id: str
    status: PaperTradeStatus
    entry_price: Decimal
    exit_price: Decimal | None = None
    stop_loss: Decimal
    take_profit: Decimal | None = None
    risk_percent: Decimal
    position_size: Decimal
    entry_reason: str
    emotion: str
    source_of_idea: str | None = None
    halal_status_at_entry: str
    instrument_status_at_entry: str
    combined_status_at_entry: str
    opened_at: datetime
    closed_at: datetime | None = None
    result_amount: Decimal | None = None
    result_percent: Decimal | None = None
    close_reason: str | None = None


class PaperTradeRead(PaperTradeBase, SoftDeleteReadMixin):
    pass


class PaperTradeSummary(OrmSchema):
    id: str
    asset_id: str
    instrument_id: str
    status: PaperTradeStatus
    entry_price: Decimal
    stop_loss: Decimal
    take_profit: Decimal | None = None
    opened_at: datetime | None = None
    closed_at: datetime | None = None
