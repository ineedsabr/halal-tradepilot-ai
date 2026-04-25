from decimal import Decimal

from sqlalchemy import Integer, JSON, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from ..db.base import Base
from .mixins import IdMixin, TimestampMixin


class AIOutputLog(IdMixin, TimestampMixin, Base):
    __tablename__ = "ai_output_logs"

    subject_ref_hash: Mapped[str | None] = mapped_column(String(128), index=True, nullable=True)
    feature: Mapped[str] = mapped_column(String(128), nullable=False)
    purpose: Mapped[str | None] = mapped_column(String(128), nullable=True)
    input_hash: Mapped[str | None] = mapped_column(String(128), nullable=True)
    prompt_hash: Mapped[str | None] = mapped_column(String(128), nullable=True)
    output_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    validation_status: Mapped[str] = mapped_column(String(64), nullable=False)
    failure_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    provider: Mapped[str | None] = mapped_column(String(128), nullable=True)
    model_name: Mapped[str | None] = mapped_column(String(128), nullable=True)
    input_tokens: Mapped[int | None] = mapped_column(Integer, nullable=True)
    output_tokens: Mapped[int | None] = mapped_column(Integer, nullable=True)
    cost_estimate: Mapped[Decimal | None] = mapped_column(Numeric(18, 8), nullable=True)
