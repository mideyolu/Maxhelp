from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    name: str = Field(..., max_length=100)
    email: EmailStr  # Required field
    password: str = Field(..., min_length=8)
    role: Optional[str] = None
    unit_id: Optional[int] = None
    

class UserLogin(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    unit_id: Optional[int]
    created_at: datetime  # Changed to datetime for better handling

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str  # Fixed typo in the token field
    token_type: str
