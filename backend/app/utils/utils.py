from passlib.context import CryptContext
from jwt import PyJWTError, PyJWT
from datetime import datetime, timedelta
from db.session import settings
from typing import Optional
from fastapi.security import OAuth2PasswordBearer

# Password context for hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme for extracting token
oauth2_scheme_user = OAuth2PasswordBearer(tokenUrl="auth/admin/login/")


# Hash password
def hash_password(password: str) -> str:
    return pwd_context.hash(password)


# Verify password
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# Create access token
def create_access_token(data: dict, expires_delta: timedelta) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})

    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


# Verify access token
def verify_access_token(token: str) -> Optional[dict]:
    try:
        payload = PyJWT().decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        return payload
    except PyJWTError:
        return None
