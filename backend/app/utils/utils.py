from passlib.context import CryptContext
from jwt.exceptions import PyJWTError
from jose import jwt, JWTError
from datetime import datetime, timedelta
from db.session import settings
from typing import Optional
from fastapi.security import OAuth2PasswordBearer



# OAuth2 scheme for extracting token
oauth2_scheme_user = OAuth2PasswordBearer(tokenUrl="auth/admin/login/")




pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """
    Hash a plain text password using bcrypt.
    """
    return pwd_context.hash(password)



# Verify password
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# Create access token
def create_access_token(data: dict, expires_delta: timedelta) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})  # Add expiration to the payload
    # Use jwt.encode directly
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

# Verify access token
def verify_access_token(token: str) -> Optional[dict]:
    try:
        # Use jwt.decode directly
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload  # Decoded token payload
    except JWTError:
        return None
