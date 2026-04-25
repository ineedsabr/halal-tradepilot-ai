from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column

from ..db.base import Base
from .mixins import IdMixin, SoftDeleteMixin, TimestampMixin


class DataSource(IdMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "data_sources"

    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    source_type: Mapped[str] = mapped_column(String(64), nullable=False)
    base_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
