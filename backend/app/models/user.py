from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from ..db.base import Base
from .mixins import IdMixin, SoftDeleteMixin, TimestampMixin


class User(IdMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "users"

    telegram_id_hash: Mapped[str | None] = mapped_column(String(128), unique=True, index=True, nullable=True)
    username: Mapped[str | None] = mapped_column(String(128), nullable=True)
    locale: Mapped[str | None] = mapped_column(String(8), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    language: Mapped[str] = mapped_column(String(8), default="en", nullable=False)
    theme: Mapped[str] = mapped_column(String(16), default="telegram", nullable=False)
    level: Mapped[str] = mapped_column(String(32), default="learner", nullable=False)
    goal: Mapped[str] = mapped_column(String(32), default="learn", nullable=False)
    methodology: Mapped[str] = mapped_column(String(64), default="conservative", nullable=False)
    risk_profile: Mapped[str] = mapped_column(String(32), default="conservative", nullable=False)
    demo_deposit: Mapped[int] = mapped_column(Integer, default=10000, nullable=False)
    notifications_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    disclaimer_accepted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    terms_accepted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    privacy_accepted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
