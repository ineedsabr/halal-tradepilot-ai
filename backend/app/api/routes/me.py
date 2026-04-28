from datetime import UTC, datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ...db.session import get_db
from ...models import User
from ...modules.auth.dependencies import get_current_user
from ...schemas.settings import UserSettingsRead, UserSettingsUpdate

router = APIRouter(prefix="/api/v1/me", tags=["me"])

RISK_PROFILE_TO_MAX_RISK = {
    "conservative": 0.005,
    "moderate": 0.01,
    "active": 0.02,
}
SETTINGS_FIELDS = (
    "language",
    "theme",
    "level",
    "goal",
    "methodology",
    "risk_profile",
    "demo_deposit",
    "notifications_enabled",
)


def _utc_now() -> datetime:
    return datetime.now(tz=UTC)


def _is_onboarding_completed(user: User) -> bool:
    required_values = [
        user.language,
        user.theme,
        user.level,
        user.goal,
        user.methodology,
        user.risk_profile,
        user.demo_deposit,
    ]
    return (
        all(value is not None for value in required_values)
        and user.disclaimer_accepted_at is not None
        and user.terms_accepted_at is not None
        and user.privacy_accepted_at is not None
    )


def _settings_response(user: User) -> UserSettingsRead:
    return UserSettingsRead(
        language=user.language,
        theme=user.theme,
        level=user.level,
        goal=user.goal,
        methodology=user.methodology,
        risk_profile=user.risk_profile,
        max_risk_per_trade=RISK_PROFILE_TO_MAX_RISK[user.risk_profile],
        demo_deposit=user.demo_deposit,
        notifications_enabled=user.notifications_enabled,
        disclaimer_accepted_at=user.disclaimer_accepted_at,
        terms_accepted_at=user.terms_accepted_at,
        privacy_accepted_at=user.privacy_accepted_at,
        onboarding_completed=_is_onboarding_completed(user),
    )


@router.get("/settings", response_model=UserSettingsRead)
def get_settings(current_user: User = Depends(get_current_user)) -> UserSettingsRead:
    return _settings_response(current_user)


@router.put("/settings", response_model=UserSettingsRead)
def update_settings(
    payload: UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserSettingsRead:
    updates = payload.model_dump(exclude_unset=True, mode="json")

    for field in SETTINGS_FIELDS:
        if field in updates:
            setattr(current_user, field, updates[field])

    now = _utc_now()
    if updates.get("disclaimer_accepted") is True and current_user.disclaimer_accepted_at is None:
        current_user.disclaimer_accepted_at = now
    if updates.get("terms_accepted") is True and current_user.terms_accepted_at is None:
        current_user.terms_accepted_at = now
    if updates.get("privacy_accepted") is True and current_user.privacy_accepted_at is None:
        current_user.privacy_accepted_at = now

    db.commit()
    db.refresh(current_user)
    return _settings_response(current_user)
