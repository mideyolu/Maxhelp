from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from db.session import get_session
from db.models  import Order, OrderItem, Inventory, BusinessUnit, User
from schemas.order import OrderCreate, OrderResponse, OrderItemCreate, OrderItemResponse
from utils.utils import verify_access_token, oauth2_scheme_user
from typing import List
router = APIRouter()


@router.post("/place-order", response_model=OrderResponse)
async def place_order(
    order_create: OrderCreate,
    db: AsyncSession = Depends(get_session),
    token: str = Depends(oauth2_scheme_user),
):
    """
    Endpoint for customers to place orders using inventory names.
    Inventory quantities are reduced for ordered items.
    """
    # Verify the user's token
    payload = verify_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    # Get the current user
    statement = select(User).where(User.email == payload["sub"])
    result = await db.execute(statement)
    current_user = result.scalars().first()

    if not current_user or current_user.role != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customers can place orders.",
        )

    # Fetch the business unit by name
    unit_statement = select(BusinessUnit).where(BusinessUnit.name == order_create.unit_name)
    unit_result = await db.execute(unit_statement)
    business_unit = unit_result.scalars().first()

    if not business_unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business unit does not exist.",
        )

    # Calculate total amount and validate inventory
    total_amount = 0
    for item in order_create.items:
        # Fetch inventory by name and business unit
        inventory_stmt = select(Inventory).where(
            Inventory.name == item.inventory_name, Inventory.unit_id == business_unit.id
        )
        inventory_result = await db.execute(inventory_stmt)
        inventory_item = inventory_result.scalars().first()

        if not inventory_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Inventory item '{item.inventory_name}' does not exist in this business unit.",
            )
        if inventory_item.quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Not enough stock for item '{inventory_item.name}'. Available: {inventory_item.quantity}",
            )

        total_amount += item.quantity * inventory_item.price
        # Deduct quantity
        inventory_item.quantity -= item.quantity
        db.add(inventory_item)

    # Create the order
    order = Order(
        user_id=current_user.id,
        unit_id=business_unit.id,
        order_type=order_create.order_type,
        total_amount=total_amount,
    )
    db.add(order)
    await db.commit()
    await db.refresh(order)

    # Create order items
    for item in order_create.items:
        # Fetch inventory again for accurate pricing
        inventory_stmt = select(Inventory).where(
            Inventory.name == item.inventory_name, Inventory.unit_id == business_unit.id
        )
        inventory_result = await db.execute(inventory_stmt)
        inventory_item = inventory_result.scalars().first()

        order_item = OrderItem(
            order_id=order.id,
            inventory_id=inventory_item.id,
            quantity=item.quantity,
            price=inventory_item.price,
        )
        db.add(order_item)

    await db.commit()

    return order


@router.get("/list-orders", response_model=List[OrderResponse])
async def get_orders(
    db: AsyncSession = Depends(get_session),
    token: str = Depends(oauth2_scheme_user),
):
    """
    Endpoint to retrieve orders:
    - Admins see all orders.
    - Employees see orders for their assigned business unit.
    """
    # Verify the user's token
    payload = verify_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    # Get the current user
    statement = select(User).where(User.email == payload["sub"])
    result = await db.execute(statement)
    current_user = result.scalars().first()

    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    # Admins can view all orders
    if current_user.role == "admin":
        order_stmt = select(Order)
    elif current_user.role == "employee":
        # Employees can only view orders for their assigned unit
        order_stmt = select(Order).where(Order.unit_id == current_user.unit_id)
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied.",
        )

    orders_result = await db.execute(order_stmt)
    orders = orders_result.scalars().all()

    return orders
