from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    name: str = Field(..., max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)
    gender: Optional[str] = Field(default=None, max_length=6)  # Optional gender field
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
    gender: Optional[str]  # Include gender in response
    unit_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str  # Fixed typo in the token field
    token_type: str


# Define the Pydantic model for the User
class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    gender: str
    unit_id: int
    created_at: str

    class Config:
        orm_mode = True  # Tells Pydantic to treat SQLAlchemy models as dicts

# Response for gender counts
class GenderCountOut(BaseModel):
    male: int
    female: int


# Define the Pydantic model for updating an employee
class UserUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    password: str | None = None
    unit_id: int | None = None
    gender: str | None = None
