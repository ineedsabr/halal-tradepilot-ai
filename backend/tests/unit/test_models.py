from sqlalchemy import create_engine

from backend.app.db.base import Base
from backend.app.models import (
    AdminUser,
    AIOutputLog,
    Asset,
    AuditLog,
    DataSource,
    HalalAssessment,
    Instrument,
    InstrumentAssessment,
    JournalEntry,
    MarketBrief,
    PaperTrade,
    RiskCalculation,
    SourceConflict,
    Subscription,
    User,
    WatchlistItem,
)


def test_models_register_expected_tables() -> None:
    expected_tables = {
        "admin_users",
        "ai_output_logs",
        "assets",
        "audit_logs",
        "data_sources",
        "halal_assessments",
        "instrument_assessments",
        "instruments",
        "journal_entries",
        "market_briefs",
        "paper_trades",
        "risk_calculations",
        "source_conflicts",
        "subscriptions",
        "users",
        "watchlist_items",
    }

    assert expected_tables.issubset(Base.metadata.tables.keys())


def test_models_create_all_with_sqlite() -> None:
    engine = create_engine("sqlite:///:memory:")

    Base.metadata.create_all(bind=engine)

    assert User.__tablename__ in Base.metadata.tables
    assert Asset.__tablename__ in Base.metadata.tables
    assert Instrument.__tablename__ in Base.metadata.tables
    assert InstrumentAssessment.__tablename__ in Base.metadata.tables
    assert HalalAssessment.__tablename__ in Base.metadata.tables
    assert WatchlistItem.__tablename__ in Base.metadata.tables
    assert PaperTrade.__tablename__ in Base.metadata.tables
    assert RiskCalculation.__tablename__ in Base.metadata.tables
    assert SourceConflict.__tablename__ in Base.metadata.tables
    assert JournalEntry.__tablename__ in Base.metadata.tables
    assert Subscription.__tablename__ in Base.metadata.tables
    assert AuditLog.__tablename__ in Base.metadata.tables
    assert AdminUser.__tablename__ in Base.metadata.tables
    assert AIOutputLog.__tablename__ in Base.metadata.tables
    assert DataSource.__tablename__ in Base.metadata.tables
    assert MarketBrief.__tablename__ in Base.metadata.tables


def test_sensitive_model_columns_are_safe_placeholders() -> None:
    assert "telegram_id" not in User.__table__.columns
    assert "telegram_id_hash" in User.__table__.columns
    assert "password" not in AdminUser.__table__.columns
    assert "password_hash" in AdminUser.__table__.columns
    assert "totp_secret" not in AdminUser.__table__.columns
    assert "totp_secret_encrypted" in AdminUser.__table__.columns
    assert "user_id" not in AIOutputLog.__table__.columns
    assert "subject_ref_hash" in AIOutputLog.__table__.columns
    assert "output_text" not in AIOutputLog.__table__.columns
    assert "output_json" in AIOutputLog.__table__.columns


def test_master_prompt_model_columns_are_aligned() -> None:
    assert {"code", "name", "category", "is_absolute_restriction", "restriction_reason"}.issubset(
        Instrument.__table__.columns.keys()
    )
    assert "asset_id" not in Instrument.__table__.columns
    assert "symbol" not in Instrument.__table__.columns

    assert "asset_id" in WatchlistItem.__table__.columns
    assert "instrument_id" not in WatchlistItem.__table__.columns

    assert {
        "asset_id",
        "instrument_id",
        "entry_price",
        "exit_price",
        "stop_loss",
        "take_profit",
        "risk_percent",
        "position_size",
        "entry_reason",
        "emotion",
        "source_of_idea",
        "halal_status_at_entry",
        "instrument_status_at_entry",
        "combined_status_at_entry",
        "opened_at",
        "closed_at",
        "result_amount",
        "result_percent",
        "close_reason",
    }.issubset(PaperTrade.__table__.columns.keys())

    assert {
        "user_id",
        "asset_id",
        "instrument_id",
        "deposit",
        "entry_price",
        "stop_loss",
        "take_profit",
        "risk_percent",
        "position_size",
        "max_loss",
        "risk_reward",
        "verdict",
        "blocked_reason",
        "caution_reason",
    }.issubset(RiskCalculation.__table__.columns.keys())

    assert {
        "methodology",
        "asset_status",
        "business_screen_status",
        "financial_screen_status",
        "crypto_screen_status",
        "summary",
        "detailed_reason",
        "source_name",
        "source_url",
        "source_date",
        "data_quality_status",
        "data_freshness_status",
        "confidence",
        "reviewed_by_admin_id",
        "reviewed_at",
        "next_review_at",
        "is_current",
    }.issubset(HalalAssessment.__table__.columns.keys())

    assert {"status", "reason", "methodology", "confidence"}.issubset(
        InstrumentAssessment.__table__.columns.keys()
    )

    assert {
        "asset_id",
        "conflict_type",
        "source_a",
        "source_b",
        "status",
        "resolution_note",
        "resolved_by_admin_id",
        "resolved_at",
    }.issubset(SourceConflict.__table__.columns.keys())
