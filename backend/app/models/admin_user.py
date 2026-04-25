from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column

from ..db.base import Base
from .mixins import IdMixin, SoftDeleteMixin, TimestampMixin


class AdminUser(IdMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "admin_users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    totp_secret_encrypted: Mapped[str | None] = mapped_column(String(512), nullable=True)
    display_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    role: Mapped[str] = mapped_column(String(64), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
