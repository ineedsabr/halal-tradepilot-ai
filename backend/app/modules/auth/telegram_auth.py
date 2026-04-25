import hashlib
import hmac
import json
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from typing import Any
from urllib.parse import parse_qsl

import jwt
from sqlalchemy import select
from sqlalchemy.orm import Session

from ...core.config import settings
from ...models.user import User

INIT_DATA_MAX_AGE = timedelta(hours=24)


class TelegramAuthError(ValueError):
    pass


@dataclass(frozen=True)
class ValidTelegramUser:
    telegram_id_hash: str
    username: str | None
    locale: str | None


def _parse_init_data(init_data: str) -> dict[str, str]:
    try:
        return dict(parse_qsl(init_data, keep_blank_values=True, strict_parsing=True))
    except ValueError as exc:
        raise TelegramAuthError("Invalid Telegram init data") from exc


def _build_data_check_string(parsed_data: dict[str, str]) -> str:
    return "\n".join(
        f"{key}={value}"
        for key, value in sorted(parsed_data.items())
        if key != "hash"
    )


def _calculate_init_data_hash(data_check_string: str) -> str:
    secret_key = hmac.new(
        b"WebAppData",
        settings.telegram_bot_token.encode(),
        hashlib.sha256,
    ).digest()
    return hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()


def _validate_auth_date(auth_date_value: str) -> None:
    try:
        auth_date = datetime.fromtimestamp(int(auth_date_value), tz=UTC)
    except (TypeError, ValueError) as exc:
        raise TelegramAuthError("Invalid Telegram auth date") from exc

    now = datetime.now(tz=UTC)
    if auth_date > now + timedelta(minutes=1):
        raise TelegramAuthError("Invalid Telegram auth date")
    if now - auth_date > INIT_DATA_MAX_AGE:
        raise TelegramAuthError("Telegram session expired")


def _hash_subject(value: str) -> str:
    return hmac.new(settings.jwt_secret.encode(), value.encode(), hashlib.sha256).hexdigest()


def validate_telegram_init_data(init_data: str) -> ValidTelegramUser:
    parsed_data = _parse_init_data(init_data)
    received_hash = parsed_data.get("hash")
    auth_date = parsed_data.get("auth_date")
    user_data = parsed_data.get("user")

    if not received_hash or not auth_date or not user_data:
        raise TelegramAuthError("Invalid Telegram init data")

    calculated_hash = _calculate_init_data_hash(_build_data_check_string(parsed_data))
    if not hmac.compare_digest(calculated_hash, received_hash):
        raise TelegramAuthError("Invalid Telegram init data")

    _validate_auth_date(auth_date)

    try:
        user_payload: dict[str, Any] = json.loads(user_data)
    except json.JSONDecodeError as exc:
        raise TelegramAuthError("Invalid Telegram user payload") from exc

    telegram_id = user_payload.get("id")
    if telegram_id is None:
        raise TelegramAuthError("Invalid Telegram user payload")

    return ValidTelegramUser(
        telegram_id_hash=_hash_subject(str(telegram_id)),
        username=user_payload.get("username"),
        locale=user_payload.get("language_code"),
    )


def create_or_update_user(db: Session, telegram_user: ValidTelegramUser) -> User:
    user = db.scalar(select(User).where(User.telegram_id_hash == telegram_user.telegram_id_hash))

    if user is None:
        user = User(
            telegram_id_hash=telegram_user.telegram_id_hash,
            username=telegram_user.username,
            locale=telegram_user.locale,
            is_active=True,
        )
        db.add(user)
    else:
        user.username = telegram_user.username
        user.locale = telegram_user.locale
        user.is_active = True
        user.deleted_at = None

    db.commit()
    db.refresh(user)
    return user


def issue_access_token(user: User) -> tuple[str, int]:
    expires_delta = timedelta(minutes=settings.jwt_expires_minutes)
    now = datetime.now(tz=UTC)
    expires_at = now + expires_delta
    token = jwt.encode(
        {
            "sub": user.id,
            "iat": int(now.timestamp()),
            "exp": int(expires_at.timestamp()),
        },
        settings.jwt_secret,
        algorithm="HS256",
    )
    return token, int(expires_delta.total_seconds())
