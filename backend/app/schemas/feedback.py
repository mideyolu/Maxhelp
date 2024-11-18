from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class FeedbackCreate(BaseModel):
    unit_name: str = Field(..., max_length=100)  # Business unit name
    comment: str = Field(..., max_length=500)  # Required comment with max length
    rating: Optional[int] = Field(None, ge=1, le=5)  # Optional rating, must be between 1 and 5


class FeedbackResponse(BaseModel):
    id: int
    user_id: int
    unit_id: int
    comment: str
    rating: Optional[int]
    created_at: datetime
    unit_name: str  # Include unit name in the response

    class Config:
        from_attributes = True
