from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from ..db.base import Base
from .mixins import IdMixin, SoftDeleteMixin, TimestampMixin


class MarketBrief(IdMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "market_briefs"

    data_source_id: Mapped[str | None] = mapped_column(ForeignKey("data_sources.id"), index=True, nullable=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    published_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
