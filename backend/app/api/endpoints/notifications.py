from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from db.session import get_session
from db.models import Notification, Inventory, User, BusinessUnit
from sqlmodel import select
from datetime import datetime
from schemas.notification import NotificationCreate, NotificationResponse
from utils.utils import verify_access_token, oauth2_scheme_user
from uuid import uuid4
from typing import List

router = APIRouter()

# Threshold to consider low inventory
LOW_INVENTORY_THRESHOLD = 10 

@router.post("/report-low-inventory")
async def report_low_inventory(
    inventory_id: int,
    db: AsyncSession = Depends(get_session),
    token: str = Depends(oauth2_scheme_user),  # Token to verify employee role
):
    """
    Endpoint for employees to report low inventory in their assigned unit.
    """
    # Verify the user's token
    payload = verify_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    # Get current user from the payload
    statement = select(User).where(User.email == payload["sub"])
    result = await db.execute(statement)
    current_user = result.scalars().first()

    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if current_user.role != "employee":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only employees can report low inventory",
        )

    # Fetch the inventory item by inventory_id
    statement = select(Inventory).where(Inventory.id == inventory_id)
    result = await db.execute(statement)
    inventory_item = result.scalars().first()

    if inventory_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item not found",
        )

    # Ensure the employee is reporting for an inventory item from their unit
    if inventory_item.unit_id != current_user.unit_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only report low inventory for items in your assigned unit",
        )

    # Check if the inventory level is below the low inventory threshold
    if inventory_item.quantity >= LOW_INVENTORY_THRESHOLD:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Inventory is not below the low inventory threshold ({LOW_INVENTORY_THRESHOLD})",
        )

    # Create notification for low inventory
    notification = Notification(
        inventory_id=inventory_item.id,
        message=f"Inventory for item '{inventory_item.name}' is below the reorder level. Current quantity: {inventory_item.quantity}",
        resolved=False,
    )
    db.add(notification)
    await db.commit()
    await db.refresh(notification)

    # Fetch the BusinessUnit and related details for reporting
    business_unit_statement = select(BusinessUnit).where(BusinessUnit.id == inventory_item.unit_id)
    result = await db.execute(business_unit_statement)
    business_unit = result.scalars().first()

    # Fetch total employees in the unit
    employee_count_statement = select(User).where(User.unit_id == inventory_item.unit_id)
    result = await db.execute(employee_count_statement)
    total_employees = result.scalars().count()

    # Add extra info to the notification
    notification_details = {
        "business_unit_name": business_unit.name if business_unit else "Unknown",
        "location": business_unit.location if business_unit else "Unknown",
        "total_employees": total_employees,
        "inventory_item_name": inventory_item.name,
        "price": inventory_item.price,
        "quantity": inventory_item.quantity,
    }

    return {"message": "Low inventory reported successfully", "notification": notification_details}


@router.get("/low-inventory", response_model=List[NotificationResponse])
async def check_low_inventory(
    db: AsyncSession = Depends(get_session),
    token: str = Depends(oauth2_scheme_user),
):
    """
    Endpoint for admins to check for low inventory in all units.
    """
    # Verify the user's token
    payload = verify_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    # Get current user from the payload
    statement = select(User).where(User.email == payload["sub"])
    result = await db.execute(statement)
    current_user = result.scalars().first()

    if current_user is None or current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can check for low inventory",
        )

    # Fetch all low inventory items
    statement = select(Inventory).where(Inventory.quantity < LOW_INVENTORY_THRESHOLD)
    result = await db.execute(statement)
    low_inventory_items = result.scalars().all()

    notifications = []

    for item in low_inventory_items:
        # Fetch the associated business unit
        business_unit_statement = select(BusinessUnit).where(BusinessUnit.id == item.unit_id)
        result = await db.execute(business_unit_statement)
        business_unit = result.scalars().first()

        if not business_unit:
            continue  # Skip if business unit is not found

        # Fetch the number of employees in the unit
        employee_count_statement = select(User).where(User.unit_id == item.unit_id)
        result = await db.execute(employee_count_statement)
        total_employees = len(result.scalars().all())

        # Create notification object
        notification = NotificationResponse(
            id=item.id,  # Database will auto-generate this
            inventory_id=item.id,
            message=f"Low inventory for {item.name} in {business_unit.name}",
            resolved=False,
            created_at=datetime.utcnow(),
            resolved_at=None,
            business_unit_name=business_unit.name,
            location=business_unit.location,
            total_employees=total_employees,
            inventory_item_name=item.name,
            price=item.price,
            quantity=item.quantity,
        )

        notifications.append(notification)

    return notifications
