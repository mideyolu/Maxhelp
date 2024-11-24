from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from db.session import get_session
from sqlmodel import select
from db.models import Inventory, User, BusinessUnit
from schemas.inventory import InventoryUpdate, InventoryCreate  # Assuming schemas for inventory
from utils.utils import verify_access_token, oauth2_scheme_user

router = APIRouter()

# View inventory (Admins see all, Employees see assigned unit's inventory)
@router.get("/", response_model=list[Inventory])
async def list_inventory(
    db: AsyncSession = Depends(get_session), token: str = Depends(oauth2_scheme_user)
):
    """
    Endpoint to list inventory items.
    Admins can view all inventory, Employees can view inventory only for their assigned unit.
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

    # Admin can view all inventory
    if current_user.role == "admin":
        statement = select(Inventory)
        result = await db.execute(statement)
        inventory_items = result.scalars().all()

    # Employees can only see inventory for their assigned unit
    elif current_user.role == "employee":
        statement = select(Inventory).where(Inventory.unit_id == current_user.unit_id)
        result = await db.execute(statement)
        inventory_items = result.scalars().all()

    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Invalid role",
        )

    return inventory_items


# Update inventory (Admins can update any, Employees can only update assigned unit's inventory)
@router.put("/{item_id}", response_model=Inventory)
async def update_inventory_item(
    item_id: int,
    inventory_update: InventoryUpdate,  # Assuming we have a schema for updating inventory
    db: AsyncSession = Depends(get_session),
    token: str = Depends(oauth2_scheme_user),
    unit_name: str = None  # Business unit name in the request
):
    """
    Endpoint to update inventory item details.
    Admins can update any inventory, Employees can only update inventory assigned to their unit.
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

    # Fetch the unit based on the unit name
    if unit_name:
        unit_statement = select(BusinessUnit).where(BusinessUnit.name == unit_name)
        unit_result = await db.execute(unit_statement)
        unit = unit_result.scalars().first()

        if unit is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Business unit not found",
            )
        unit_id = unit.id
    else:
        unit_id = current_user.unit_id

    # Fetch the inventory item by item_id
    statement = select(Inventory).where(Inventory.id == item_id)
    result = await db.execute(statement)
    inventory_item = result.scalars().first()

    if inventory_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item not found",
        )

    # Check if the current user is allowed to update this item
    if current_user.role == "admin":
        # Admin can update any inventory item
        pass
    elif current_user.role == "employee":
        # Employees can only update items assigned to their unit
        if inventory_item.unit_id != unit_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only update inventory for your assigned unit",
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Invalid role",
        )

    # Update the inventory item with the provided data
    for key, value in inventory_update.dict(exclude_unset=True).items():
        setattr(inventory_item, key, value)

    db.add(inventory_item)
    await db.commit()
    await db.refresh(inventory_item)

    return inventory_item


# Delete inventory (Admins can delete any inventory, Employees can delete only inventory in their unit)
@router.delete("/{item_id}", response_model=dict)
async def delete_inventory_item(
    item_id: int,
    db: AsyncSession = Depends(get_session),
    token: str = Depends(oauth2_scheme_user),
    unit_name: str = None  # Business unit name in the request
):
    """
    Endpoint to delete an inventory item.
    Admins can delete any inventory item, Employees can delete only inventory items assigned to their unit.
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

    # Fetch the unit based on the unit name
    if unit_name:
        unit_statement = select(BusinessUnit).where(BusinessUnit.name == unit_name)
        unit_result = await db.execute(unit_statement)
        unit = unit_result.scalars().first()

        if unit is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Business unit not found",
            )
        unit_id = unit.id
    else:
        unit_id = current_user.unit_id

    # Fetch the inventory item by item_id
    statement = select(Inventory).where(Inventory.id == item_id)
    result = await db.execute(statement)
    inventory_item = result.scalars().first()

    if inventory_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item not found",
        )

    # Check if the current user is allowed to delete this item
    if current_user.role == "admin":
        # Admin can delete any inventory item
        pass
    elif current_user.role == "employee":
        # Employees can only delete items assigned to their unit
        if inventory_item.unit_id != unit_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only delete inventory for your assigned unit",
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Invalid role",
        )

    # Delete the inventory item
    await db.delete(inventory_item)
    await db.commit()

    return {"message": "Inventory item deleted successfully"}

# Inventory stats route
@router.get("/inventory-stats", response_model=dict)
async def inventory_stats(
    db: AsyncSession = Depends(get_session), token: str = Depends(oauth2_scheme_user)
):
    """
    Endpoint to get inventory statistics, including:
    - Total number of items with quantity < 10 (low inventory).
    - Total number of inventory items.
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

    # Admin can view the stats for all inventory items
    if current_user.role == "admin":
        # Fetch total number of inventory items and low stock items
        total_inventory_statement = select(Inventory)
        low_inventory_statement = select(Inventory).where(Inventory.quantity < 10)

        total_inventory_result = await db.execute(total_inventory_statement)
        low_inventory_result = await db.execute(low_inventory_statement)

        total_inventory_count = len(total_inventory_result.scalars().all())
        low_inventory_count = len(low_inventory_result.scalars().all())

    # Employees can view stats only for their assigned unit's inventory
    elif current_user.role == "employee":
        statement = select(Inventory).where(Inventory.unit_id == current_user.unit_id)
        result = await db.execute(statement)
        inventory_items = result.scalars().all()

        total_inventory_count = len(inventory_items)
        low_inventory_count = sum(1 for item in inventory_items if item.quantity < 10)

    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Invalid role",
        )

    return {
        "total_inventory": total_inventory_count,
        "low_inventory_count": low_inventory_count,
    }
