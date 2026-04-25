from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from ..db.base import Base
from .mixins import IdMixin, SoftDeleteMixin, TimestampMixin


class InstrumentAssessment(IdMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "instrument_assessments"

    instrument_id: Mapped[str] = mapped_column(ForeignKey("instruments.id"), index=True, nullable=False)
    status: Mapped[str] = mapped_column(String(64), nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    methodology: Mapped[str] = mapped_column(String(128), nullable=False)
    confidence: Mapped[str] = mapped_column(String(64), nullable=False)
