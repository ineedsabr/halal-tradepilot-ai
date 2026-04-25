from sqlalchemy import JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from ..db.base import Base
from .mixins import IdMixin, TimestampMixin


class AIOutputLog(IdMixin, TimestampMixin, Base):
    __tablename__ = "ai_output_logs"

    subject_ref_hash: Mapped[str | None] = mapped_column(String(128), index=True, nullable=True)
    purpose: Mapped[str] = mapped_column(String(128), nullable=False)
    prompt_hash: Mapped[str | None] = mapped_column(String(128), nullable=True)
    output_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    metadata_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
