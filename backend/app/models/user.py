from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column

from ..db.base import Base
from .mixins import IdMixin, SoftDeleteMixin, TimestampMixin


class User(IdMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "users"

    telegram_id_hash: Mapped[str | None] = mapped_column(String(128), unique=True, index=True, nullable=True)
    username: Mapped[str | None] = mapped_column(String(128), nullable=True)
    locale: Mapped[str | None] = mapped_column(String(8), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
