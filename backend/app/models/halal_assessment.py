from sqlalchemy import ForeignKey, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from ..db.base import Base
from .mixins import IdMixin, SoftDeleteMixin, TimestampMixin


class HalalAssessment(IdMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "halal_assessments"

    asset_id: Mapped[str] = mapped_column(ForeignKey("assets.id"), index=True, nullable=False)
    status: Mapped[str] = mapped_column(String(64), nullable=False)
    methodology_version: Mapped[str | None] = mapped_column(String(64), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    metadata_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
