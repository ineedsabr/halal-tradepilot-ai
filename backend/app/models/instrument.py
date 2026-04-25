from sqlalchemy import Boolean, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from ..db.base import Base
from .mixins import IdMixin, SoftDeleteMixin, TimestampMixin


class Instrument(IdMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "instruments"

    code: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(128), nullable=False)
    is_absolute_restriction: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    restriction_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
