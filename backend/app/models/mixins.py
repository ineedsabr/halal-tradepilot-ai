from datetime import UTC, datetime
from uuid import uuid4

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column


def generate_id() -> str:
    return str(uuid4())


def utc_now() -> datetime:
    return datetime.now(tz=UTC)


class IdMixin:
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_id)


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )


class SoftDeleteMixin:
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
