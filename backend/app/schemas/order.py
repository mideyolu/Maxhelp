from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


# Schema for creating an OrderItem
class OrderItemCreate(BaseModel):
    inventory_name: str
    quantity: int


# Schema for creating an Order
class OrderCreate(BaseModel):
    unit_name: str  # Use the name of the business unit
    order_type: str = Field(..., max_length=20)
    items: List[OrderItemCreate]


# Schema for an Order response
class OrderResponse(BaseModel):
    id: int
    user_id: int
    unit_id: int
    order_type: str
    total_amount: float
    created_at: datetime

    class Config:
        from_attributes = True


# Schema for an OrderItem response
class OrderItemResponse(BaseModel):
    id: int
    order_id: int
    inventory_id: int
    quantity: int
    price: float

    class Config:
        from_attributes = True
