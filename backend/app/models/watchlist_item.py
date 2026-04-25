from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from ..db.base import Base
from .mixins import IdMixin, SoftDeleteMixin, TimestampMixin


class WatchlistItem(IdMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "watchlist_items"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
    instrument_id: Mapped[str] = mapped_column(ForeignKey("instruments.id"), index=True, nullable=False)
