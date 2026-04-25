from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from ..db.base import Base
from .mixins import IdMixin, SoftDeleteMixin, TimestampMixin


class HalalAssessment(IdMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "halal_assessments"

    asset_id: Mapped[str] = mapped_column(ForeignKey("assets.id"), index=True, nullable=False)
    methodology: Mapped[str] = mapped_column(String(128), nullable=False)
    asset_status: Mapped[str] = mapped_column(String(64), nullable=False)
    business_screen_status: Mapped[str | None] = mapped_column(String(64), nullable=True)
    financial_screen_status: Mapped[str | None] = mapped_column(String(64), nullable=True)
    crypto_screen_status: Mapped[str | None] = mapped_column(String(64), nullable=True)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    detailed_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_name: Mapped[str] = mapped_column(String(255), nullable=False)
    source_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    source_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    data_quality_status: Mapped[str] = mapped_column(String(64), nullable=False)
    data_freshness_status: Mapped[str] = mapped_column(String(64), nullable=False)
    confidence: Mapped[str] = mapped_column(String(64), nullable=False)
    reviewed_by_admin_id: Mapped[str | None] = mapped_column(ForeignKey("admin_users.id"), index=True, nullable=True)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    next_review_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    is_current: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
