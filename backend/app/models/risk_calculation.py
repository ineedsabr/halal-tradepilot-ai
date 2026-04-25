from decimal import Decimal

from sqlalchemy import ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from ..db.base import Base
from .mixins import IdMixin, TimestampMixin


class RiskCalculation(IdMixin, TimestampMixin, Base):
    __tablename__ = "risk_calculations"

    user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), index=True, nullable=True)
    asset_id: Mapped[str | None] = mapped_column(ForeignKey("assets.id"), index=True, nullable=True)
    instrument_id: Mapped[str | None] = mapped_column(ForeignKey("instruments.id"), index=True, nullable=True)
    deposit: Mapped[Decimal] = mapped_column(Numeric(18, 8), nullable=False)
    entry_price: Mapped[Decimal] = mapped_column(Numeric(18, 8), nullable=False)
    stop_loss: Mapped[Decimal] = mapped_column(Numeric(18, 8), nullable=False)
    take_profit: Mapped[Decimal | None] = mapped_column(Numeric(18, 8), nullable=True)
    risk_percent: Mapped[Decimal] = mapped_column(Numeric(8, 4), nullable=False)
    position_size: Mapped[Decimal] = mapped_column(Numeric(18, 8), nullable=False)
    max_loss: Mapped[Decimal] = mapped_column(Numeric(18, 8), nullable=False)
    risk_reward: Mapped[Decimal | None] = mapped_column(Numeric(18, 8), nullable=True)
    verdict: Mapped[str] = mapped_column(String(64), nullable=False)
    blocked_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    caution_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
