from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from ..db.base import Base
from .mixins import IdMixin, SoftDeleteMixin, TimestampMixin


class SourceConflict(IdMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "source_conflicts"

    asset_id: Mapped[str | None] = mapped_column(ForeignKey("assets.id"), index=True, nullable=True)
    conflict_type: Mapped[str] = mapped_column(String(128), nullable=False)
    source_a: Mapped[dict] = mapped_column(JSON, nullable=False)
    source_b: Mapped[dict] = mapped_column(JSON, nullable=False)
    status: Mapped[str] = mapped_column(String(64), nullable=False)
    resolution_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    resolved_by_admin_id: Mapped[str | None] = mapped_column(ForeignKey("admin_users.id"), index=True, nullable=True)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
