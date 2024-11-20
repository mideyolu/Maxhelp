# models.py
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(nullable=False, max_length=100)
    email: str = Field(nullable=False, unique=True, max_length=150)
    role: str = Field(nullable=False, max_length=50)
    password_hash: str = Field(nullable=False, max_length=255)  # Storing hashed passwords
    gender: Optional[str] = Field(default=None, max_length=10)  # Optional gender field
    unit_id: Optional[int] = Field(default=None, foreign_key="businessunit.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    business_unit: Optional["BusinessUnit"] = Relationship(back_populates="employees")


class BusinessUnit(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(nullable=False, max_length=100, unique=True)  # Max length 100
    location: str = Field(nullable=False, max_length=50)  # Max length 50
    employees: List["User"] = Relationship(back_populates="business_unit")
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Inventory(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    unit_id: int = Field(foreign_key="businessunit.id", nullable=False)
    name: str = Field(nullable=False, max_length=100)  # Max length 100
    description: Optional[str] = Field(max_length=255)  # Max length 255
    quantity: int = Field(nullable=False)
    reorder_level: int = Field(nullable=False)
    price: float = Field(nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Order(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(foreign_key="user.id")
    unit_id: int = Field(foreign_key="businessunit.id")
    order_type: str = Field(nullable=False, max_length=20)  # Max length 20
    total_amount: float = Field(nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class OrderItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    order_id: int = Field(foreign_key="order.id")
    inventory_id: int = Field(foreign_key="inventory.id")
    quantity: int = Field(nullable=False)
    price: float = Field(nullable=False)

class Feedback(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    unit_id: int = Field(foreign_key="businessunit.id")
    comment: str = Field(max_length=500)  # Max length 500
    rating: Optional[int] = Field(default=None, ge=1, le=5)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class FinancialReport(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    unit_id: int = Field(foreign_key="businessunit.id")
    total_sales: float = Field(nullable=False)
    total_expenses: float = Field(nullable=False)
    profit: float = Field(default=0, nullable=False)
    report_date: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Notification(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    inventory_id: int = Field(foreign_key="inventory.id")
    message: str = Field(max_length=255)  # Max length 255
    resolved: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None
