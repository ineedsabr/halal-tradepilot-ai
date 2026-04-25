from .base import Base
from .session import engine, settings


def init_db() -> None:
    """Create SQLite tables only for local development and tests.

    Production database changes must be handled by Alembic migrations in the
    dedicated database migration task.
    """
    if settings.app_env in {"development", "test"} and settings.database_url.startswith("sqlite"):
        import backend.app.models  # noqa: F401

        Base.metadata.create_all(bind=engine)
