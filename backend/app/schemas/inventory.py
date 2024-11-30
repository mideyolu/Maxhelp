from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# Shared attributes for Inventory (used for creation and updates)
class InventoryCreate(BaseModel):
    unit_id: int = Field(..., description="ID of the business unit")
    name: str = Field(..., max_length=100, description="Name of the inventory item")
    description: Optional[str] = Field(None, max_length=255, description="Description of the item")
    quantity: int = Field(..., ge=0, description="Quantity of the inventory item")
    reorder_level: int = Field(..., ge=0, description="Reorder level to trigger restocking")
    price: float = Field(..., ge=0, description="Price per unit of the item")



# Schema for updating inventory items
class InventoryUpdate(BaseModel):
    quantity: Optional[int] = Field(None, ge=0, description="Updated quantity of the inventory item")
    reorder_level: Optional[int] = Field(None, ge=0, description="Updated reorder level")
    price: Optional[float] = Field(None, ge=0, description="Updated price per unit")


# Schema for viewing inventory items
class InventoryResponse(InventoryCreate):
    id: int = Field(..., description="ID of the inventory item")
    created_at: datetime = Field(..., description="Timestamp when the item was created")

    class Config:
        from_attributes = True


# class ReportLowInventoryRequest(BaseModel):
#     inventory_id: int

class ReportLowInventoryRequest(BaseModel):
    inventory_name: str 