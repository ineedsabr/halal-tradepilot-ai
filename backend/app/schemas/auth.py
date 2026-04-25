from pydantic import BaseModel, Field


class TelegramAuthRequest(BaseModel):
    init_data: str = Field(min_length=1)


class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
