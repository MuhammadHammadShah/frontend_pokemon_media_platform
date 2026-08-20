from typing import Optional
import uuid
from fastapi import Depends, Request
from fastapi_users import BaseUserManager, FastAPIUsers, UUIDIDMixin, models
from fastapi_users.authentication import (
    AuthenticationBackend,
    BearerTransport,
    JWTStrategy
)
from fastapi_users.db import SQLAlchemyUserDatabase
from app.db import User, get_user_db
import os
from dotenv import load_dotenv

load_dotenv()

SECRET = os.getenv("JWT_SECRET", "pokemon_champion_secret_key_12345")


class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    reset_password_token_secret = SECRET
    verification_token_secret = SECRET

    async def on_after_register(self, user: User, request: Optional[Request] = None):
        print(f"Trainer registered with ID: {user.id}")
        return await super().on_after_register(user, request)

    async def on_after_forgot_password(self, user: User, token: str, request: Optional[Request] = None):
        return await super().on_after_forgot_password(user, token, request)

    async def on_after_request_verify(self, user: User, token: str, request: Optional[Request] = None):
        return await super().on_after_request_verify(user, token, request)


async def get_user_manager(user_db: SQLAlchemyUserDatabase = Depends(get_user_db)):
    yield UserManager(user_db)


bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")


def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(secret=SECRET, lifetime_seconds=86400 * 7)  # 7 days lifetime


auth_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy
)

fastapi_users = FastAPIUsers[User, uuid.UUID](get_user_manager, [auth_backend])
current_active_user = fastapi_users.current_user(active=True)
