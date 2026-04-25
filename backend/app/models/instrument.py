from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from ..db.base import Base
from .mixins import IdMixin, SoftDeleteMixin, TimestampMixin


class Instrument(IdMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "instruments"

    asset_id: Mapped[str] = mapped_column(ForeignKey("assets.id"), index=True, nullable=False)
    symbol: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    exchange: Mapped[str | None] = mapped_column(String(128), nullable=True)
    currency: Mapped[str | None] = mapped_column(String(16), nullable=True)
