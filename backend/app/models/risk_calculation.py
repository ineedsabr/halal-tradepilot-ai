from sqlalchemy import JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from ..db.base import Base
from .mixins import IdMixin, TimestampMixin


class RiskCalculation(IdMixin, TimestampMixin, Base):
    __tablename__ = "risk_calculations"

    subject_ref_hash: Mapped[str | None] = mapped_column(String(128), index=True, nullable=True)
    input_hash: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    verdict: Mapped[str] = mapped_column(String(64), nullable=False)
    result_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
