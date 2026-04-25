from datetime import datetime

from .common import OrmSchema, SoftDeleteReadMixin


class JournalEntryBase(OrmSchema):
    user_id: str
    title: str
    body: str | None = None


class JournalEntryRead(JournalEntryBase, SoftDeleteReadMixin):
    pass


class JournalEntrySummary(OrmSchema):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
