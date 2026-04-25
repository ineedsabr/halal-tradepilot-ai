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
    instrument_id: str
    side: str
    quantity: Decimal
    price: Decimal
    status: PaperTradeStatus


class PaperTradeRead(PaperTradeBase, SoftDeleteReadMixin):
    pass


class PaperTradeSummary(OrmSchema):
    id: str
    instrument_id: str
    status: PaperTradeStatus
    opened_at: datetime | None = None
    closed_at: datetime | None = None
