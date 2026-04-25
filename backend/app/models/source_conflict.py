from sqlalchemy import JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from ..db.base import Base
from .mixins import IdMixin, SoftDeleteMixin, TimestampMixin


class SourceConflict(IdMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "source_conflicts"

    entity_type: Mapped[str] = mapped_column(String(128), nullable=False)
    entity_id: Mapped[str | None] = mapped_column(String(36), index=True, nullable=True)
    status: Mapped[str] = mapped_column(String(64), nullable=False)
    metadata_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
