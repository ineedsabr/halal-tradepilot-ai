from sqlalchemy import ForeignKey, JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from ..db.base import Base
from .mixins import IdMixin, SoftDeleteMixin, TimestampMixin


class InstrumentAssessment(IdMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "instrument_assessments"

    instrument_id: Mapped[str] = mapped_column(ForeignKey("instruments.id"), index=True, nullable=False)
    assessment_ref: Mapped[str | None] = mapped_column(String(128), nullable=True)
    status: Mapped[str] = mapped_column(String(64), nullable=False)
    metadata_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
