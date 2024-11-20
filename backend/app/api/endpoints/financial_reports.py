from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import func, extract
from db.session import get_session
from sqlmodel import select
from db.models import FinancialReport, Order, OrderItem, Inventory, User, BusinessUnit
from schemas.financial_reports import (
    SalesReportSchema,
    InventoryValuationSchema,
    RevenueByProductSchema,
    TopCustomersReportSchema,
)
from utils.utils import verify_access_token, oauth2_scheme_user

router = APIRouter()


async def get_current_user(
    token: str, db: AsyncSession
) -> User:
    """
    Utility function to retrieve the current user from the token.
    """
    payload = verify_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token"
        )

    statement = select(User).where(User.email == payload["sub"])
    result = await db.execute(statement)
    current_user = result.scalars().first()

    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    return current_user


# --- Sales Report ---
@router.get("/sales-report", response_model=SalesReportSchema)
async def get_sales_report(
    db: AsyncSession = Depends(get_session),
    token: str = Depends(oauth2_scheme_user),
):
    """
    Endpoint to retrieve sales report.
    Admins see all, Employees are restricted to their assigned unit.
    """
    current_user = await get_current_user(token, db)

    if current_user.role == "admin":
        statement = select(
            func.sum(Order.total_amount).label("total_sales"),
            func.count(Order.id).label("order_count")
        )
    elif current_user.role == "employee":
        statement = select(
            func.sum(Order.total_amount).label("total_sales"),
            func.count(Order.id).label("order_count")
        ).where(Order.unit_id == current_user.unit_id)
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Invalid role",
        )

    result = await db.execute(statement)
    total_sales, order_count = result.one()

    return {"total_sales": total_sales or 0, "order_count": order_count or 0}


# --- Inventory Valuation ---
@router.get("/inventory-valuation", response_model=InventoryValuationSchema)
async def get_inventory_valuation(
    db: AsyncSession = Depends(get_session),
    token: str = Depends(oauth2_scheme_user),
):
    """
    Endpoint to calculate inventory valuation.
    Admins see all, Employees are restricted to their assigned unit.
    """
    current_user = await get_current_user(token, db)

    if current_user.role == "admin":
        statement = select(
            func.sum(Inventory.quantity * Inventory.price).label("total_valuation")
        )
    elif current_user.role == "employee":
        statement = select(
            func.sum(Inventory.quantity * Inventory.price).label("total_valuation")
        ).where(Inventory.unit_id == current_user.unit_id)
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Invalid role",
        )

    result = await db.execute(statement)
    total_valuation = result.scalar()

    return {"total_valuation": total_valuation or 0}


# --- Revenue by Product ---
@router.get("/revenue-by-product", response_model=list[RevenueByProductSchema])
async def get_revenue_by_product(
    db: AsyncSession = Depends(get_session),
    token: str = Depends(oauth2_scheme_user),
):
    """
    Endpoint to calculate revenue by product.
    Admins see all, Employees are restricted to their assigned unit.
    """
    current_user = await get_current_user(token, db)

    if current_user.role == "admin":
        statement = select(
            Inventory.name.label("product_name"),
            func.sum(OrderItem.quantity * OrderItem.price).label("total_revenue"),
        ).join(Inventory, Inventory.id == OrderItem.inventory_id).group_by(Inventory.name)
    elif current_user.role == "employee":
        statement = select(
            Inventory.name.label("product_name"),
            func.sum(OrderItem.quantity * OrderItem.price).label("total_revenue"),
        ).join(Inventory, Inventory.id == OrderItem.inventory_id).where(
            Inventory.unit_id == current_user.unit_id
        ).group_by(Inventory.name)
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Invalid role",
        )

    result = await db.execute(statement)
    products = result.all()

    return [{"product_name": p.product_name, "total_revenue": p.total_revenue} for p in products]


# --- Top Customers ---
@router.get("/top-customers", response_model=list[TopCustomersReportSchema])
async def get_top_customers(
    db: AsyncSession = Depends(get_session),
    token: str = Depends(oauth2_scheme_user),
):
    """
    Endpoint to retrieve the top customers by revenue.
    Admins see all, Employees are restricted to their assigned unit.
    """
    current_user = await get_current_user(token, db)

    if current_user.role == "admin":
        statement = select(
            User.name.label("customer_name"),
            func.sum(Order.total_amount).label("total_spent"),
        ).join(User, User.id == Order.user_id).group_by(User.name).order_by(
            func.sum(Order.total_amount).desc()
        )
    elif current_user.role == "employee":
        statement = select(
            User.name.label("customer_name"),
            func.sum(Order.total_amount).label("total_spent"),
        ).join(User, User.id == Order.user_id).where(
            Order.unit_id == current_user.unit_id
        ).group_by(User.name).order_by(func.sum(Order.total_amount).desc())
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Invalid role",
        )

    result = await db.execute(statement)
    customers = result.all()

    return [{"customer_name": c.customer_name, "total_spent": c.total_spent} for c in customers]

@router.get("/sales-report/monthly", response_model=list[SalesReportSchema])
async def get_monthly_sales_report(
    db: AsyncSession = Depends(get_session),
    token: str = Depends(oauth2_scheme_user),
):
    """
    Endpoint to retrieve monthly sales report.
    Admins see all, Employees are restricted to their assigned unit.
    """
    current_user = await get_current_user(token, db)

    # Base query for monthly aggregation
    if current_user.role == "admin":
        statement = select(
            extract("year", Order.created_at).label("year"),
            extract("month", Order.created_at).label("month"),
            func.sum(Order.total_amount).label("total_sales"),
            func.count(Order.id).label("order_count"),
        ).group_by(extract("year", Order.created_at), extract("month", Order.created_at)).order_by(
            extract("year", Order.created_at), extract("month", Order.created_at)
        )
    elif current_user.role == "employee":
        statement = select(
            extract("year", Order.created_at).label("year"),
            extract("month", Order.created_at).label("month"),
            func.sum(Order.total_amount).label("total_sales"),
            func.count(Order.id).label("order_count"),
        ).where(Order.unit_id == current_user.unit_id).group_by(
            extract("year", Order.created_at), extract("month", Order.created_at)
        ).order_by(extract("year", Order.created_at), extract("month", Order.created_at))
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Invalid role",
        )

    result = await db.execute(statement)
    monthly_sales = result.all()

    return [
        {
            "year": int(s.year),
            "month": int(s.month),
            "total_sales": s.total_sales or 0,
            "order_count": s.order_count or 0,
        }
        for s in monthly_sales
    ]
