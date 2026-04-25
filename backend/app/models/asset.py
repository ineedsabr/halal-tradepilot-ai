from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from ..db.base import Base
from .mixins import IdMixin, SoftDeleteMixin, TimestampMixin


class Asset(IdMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "assets"

    symbol: Mapped[str] = mapped_column(String(32), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    asset_type: Mapped[str] = mapped_column(String(64), nullable=False)
