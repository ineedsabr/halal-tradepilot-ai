from decimal import Decimal

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from ..db.base import Base
from .mixins import IdMixin, SoftDeleteMixin, TimestampMixin


class PaperTrade(IdMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "paper_trades"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
    asset_id: Mapped[str] = mapped_column(ForeignKey("assets.id"), index=True, nullable=False)
    instrument_id: Mapped[str] = mapped_column(ForeignKey("instruments.id"), index=True, nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    entry_price: Mapped[Decimal] = mapped_column(Numeric(18, 8), nullable=False)
    exit_price: Mapped[Decimal | None] = mapped_column(Numeric(18, 8), nullable=True)
    stop_loss: Mapped[Decimal] = mapped_column(Numeric(18, 8), nullable=False)
    take_profit: Mapped[Decimal | None] = mapped_column(Numeric(18, 8), nullable=True)
    risk_percent: Mapped[Decimal] = mapped_column(Numeric(8, 4), nullable=False)
    position_size: Mapped[Decimal] = mapped_column(Numeric(18, 8), nullable=False)
    entry_reason: Mapped[str] = mapped_column(Text, nullable=False)
    emotion: Mapped[str] = mapped_column(String(64), nullable=False)
    source_of_idea: Mapped[str | None] = mapped_column(String(255), nullable=True)
    halal_status_at_entry: Mapped[str] = mapped_column(String(64), nullable=False)
    instrument_status_at_entry: Mapped[str] = mapped_column(String(64), nullable=False)
    combined_status_at_entry: Mapped[str] = mapped_column(String(64), nullable=False)
    opened_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    result_amount: Mapped[Decimal | None] = mapped_column(Numeric(18, 8), nullable=True)
    result_percent: Mapped[Decimal | None] = mapped_column(Numeric(8, 4), nullable=True)
    close_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
