from sqlalchemy import JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from ..db.base import Base
from .mixins import IdMixin, TimestampMixin


class AuditLog(IdMixin, TimestampMixin, Base):
    __tablename__ = "audit_logs"

    actor_id: Mapped[str | None] = mapped_column(String(36), index=True, nullable=True)
    action: Mapped[str] = mapped_column(String(128), nullable=False)
    entity_type: Mapped[str | None] = mapped_column(String(128), nullable=True)
    entity_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    metadata_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
