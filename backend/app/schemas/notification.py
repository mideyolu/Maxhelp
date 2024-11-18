# schemas/notification.py

from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class NotificationCreate(BaseModel):
    inventory_id: int
    message: str

class NotificationResponse(BaseModel):
    
    inventory_id: int  # Reference to the inventory item
    message: str
    resolved: bool
    created_at: datetime
    resolved_at: Optional[datetime]
    business_unit_name: str
    location: str
    total_employees: int
    inventory_item_name: str
    price: float
    quantity: int

    class Config:
        from_attributes = True
