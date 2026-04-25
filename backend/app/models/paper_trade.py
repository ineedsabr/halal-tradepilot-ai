from decimal import Decimal

from sqlalchemy import ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from ..db.base import Base
from .mixins import IdMixin, SoftDeleteMixin, TimestampMixin


class PaperTrade(IdMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "paper_trades"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
    instrument_id: Mapped[str] = mapped_column(ForeignKey("instruments.id"), index=True, nullable=False)
    side: Mapped[str] = mapped_column(String(16), nullable=False)
    quantity: Mapped[Decimal] = mapped_column(Numeric(18, 8), nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(18, 8), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False)
