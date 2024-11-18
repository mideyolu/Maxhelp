# app/api/endpoints/orders.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from db.session import get_session

router = APIRouter()

@router.get("/")
async def list_orders(db: AsyncSession = Depends(get_session)):
    """
    Placeholder for order listing.
    """
    return {"message": "Orders API under construction"}
