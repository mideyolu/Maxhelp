from pydantic import BaseModel
from typing import Optional
from datetime import date


class SalesReportSchema(BaseModel):
    total_sales: float
    total_expenses: float
    profit: float
    report_date: date


class InventoryValuationSchema(BaseModel):
    total_valuation: float


class RevenueByProductSchema(BaseModel):
    product_name: str
    total_revenue: float


class TopCustomersReportSchema(BaseModel):
    customer_name: str
    total_spent: float
