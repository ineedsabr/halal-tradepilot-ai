from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...db.session import get_db
from ...modules.auth.telegram_auth import (
    TelegramAuthError,
    create_or_update_user,
    issue_access_token,
    validate_telegram_init_data,
)
from ...schemas.auth import AuthTokenResponse, TelegramAuthRequest

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/telegram", response_model=AuthTokenResponse)
def telegram_auth(payload: TelegramAuthRequest, db: Session = Depends(get_db)) -> AuthTokenResponse:
    try:
        telegram_user = validate_telegram_init_data(payload.init_data)
    except TelegramAuthError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc

    user = create_or_update_user(db, telegram_user)
    access_token, expires_in = issue_access_token(user)
    return AuthTokenResponse(access_token=access_token, expires_in=expires_in)
