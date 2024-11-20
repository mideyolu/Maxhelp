from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from db.session import get_session
from sqlalchemy.future import select
from passlib.context import CryptContext
from utils.utils import hash_password, verify_password, create_access_token, verify_access_token, oauth2_scheme_user
from db.models import User, BusinessUnit, Inventory
from schemas.auth import UserCreate, UserLogin, UserResponse, Token
from schemas.inventory import InventoryCreate
from schemas.business_unit import BusinessUnitCreate
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from datetime import datetime

router = APIRouter()

# Password context for hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.post("/admin/login", response_model=Token)
async def admin_login(
    form_data: OAuth2PasswordRequestForm = Depends(),  # Using OAuth2PasswordRequestForm
    db: AsyncSession = Depends(get_session)
):
    """
    Login endpoint: For Admin
    This uses OAuth2PasswordRequestForm for form-based credentials (username/password).
    """
    statement = select(User).where(User.name == form_data.username)
    result = await db.execute(statement)
    user = result.scalars().first()

    if user is None or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    # Create JWT token on successful login
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=timedelta(hours=1)
    )
    return Token(access_token=access_token, token_type="bearer")


@router.post("/create-account", response_model=UserResponse)
async def create_account(user_create: UserCreate, db: AsyncSession = Depends(get_session)):
    # Check if the user already exists
    statement = select(User).where(User.email == user_create.email)
    result = await db.execute(statement)
    existing_user = result.scalars().first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Create the user
    user = User(
        name=user_create.name,
        email=user_create.email,
        password_hash=hash_password(user_create.password),
        role="customer",  # Default role
        gender=user_create.gender,  # Include gender if provided
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    return user

@router.post("/admin/create-business-unit", response_model=BusinessUnit)
async def create_business_unit(
    business_unit_create: BusinessUnitCreate,
    db: AsyncSession = Depends(get_session),
    token: str = Depends(oauth2_scheme_user)
):
    """
    Create a business unit: Only admins can create a business unit.
    """
    # Verify the token to ensure the user is admin
    payload = verify_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    # Check if the user is admin
    statement = select(User).where(User.email == payload["sub"])
    result = await db.execute(statement)
    current_user = result.scalars().first()

    if current_user is None or current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can create business units",
        )

    # Create the business unit
    business_unit = BusinessUnit(
        name=business_unit_create.name,
        location=business_unit_create.location,
        created_at=datetime.utcnow(),
    )
    db.add(business_unit)
    await db.commit()
    await db.refresh(business_unit)

    return business_unit


@router.post("/admin/create-employee", response_model=UserResponse)
async def create_employee(
    user_create: UserCreate,
    db: AsyncSession = Depends(get_session),
    token: str = Depends(oauth2_scheme_user)
):
    # Verify admin token
    payload = verify_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    # Check if the user is admin
    statement = select(User).where(User.email == payload["sub"])
    result = await db.execute(statement)
    current_user = result.scalars().first()

    if current_user is None or current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can create employees",
        )

    # Check for existing user
    statement = select(User).where(User.email == user_create.email)
    result = await db.execute(statement)
    existing_user = result.scalars().first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists",
        )

    # Validate business unit
    if user_create.unit_id:
        statement = select(BusinessUnit).where(BusinessUnit.id == user_create.unit_id)
        result = await db.execute(statement)
        business_unit = result.scalars().first()

        if not business_unit:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Business unit not found",
            )

    # Create employee
    employee = User(
        name=user_create.name,
        email=user_create.email,
        password_hash=hash_password(user_create.password),
        role="employee",
        unit_id=user_create.unit_id,
        gender=user_create.gender,  # Include gender if provided
    )
    db.add(employee)
    await db.commit()
    await db.refresh(employee)

    return employee


@router.post("/admin/create-inventory", response_model=Inventory)
async def create_inventory(
    inventory_create: InventoryCreate,
    db: AsyncSession = Depends(get_session),
    token: str = Depends(oauth2_scheme_user)
):
    """
    Create an inventory item: Only admins can create inventory items.
    """
    # Verify the token to ensure the user is admin
    payload = verify_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    # Check if the user is admin
    statement = select(User).where(User.email == payload["sub"])
    result = await db.execute(statement)
    current_user = result.scalars().first()

    if current_user is None or current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can create inventory items",
        )

    # Check if the business unit exists
    statement = select(BusinessUnit).where(BusinessUnit.id == inventory_create.unit_id)
    result = await db.execute(statement)
    business_unit = result.scalars().first()

    if not business_unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business unit not found",
        )

    # Create the inventory item
    inventory = Inventory(
        unit_id=inventory_create.unit_id,
        name=inventory_create.name,
        description=inventory_create.description,
        quantity=inventory_create.quantity,
        reorder_level=inventory_create.reorder_level,
        price=inventory_create.price,
        created_at=datetime.utcnow(),
    )
    db.add(inventory)
    await db.commit()
    await db.refresh(inventory)

    return inventory


@router.post("/login", response_model=dict)
async def login(
    user: UserLogin, db: AsyncSession = Depends(get_session)
) -> dict:
    """
    Endpoint for user login.
    - Verifies user credentials.
    - Returns a JWT access token if credentials are valid.

    Args:
        user (UserLogin): The user login credentials.
        db (Session): Database session dependency.

    Returns:
        dict: Access token and token type on successful login.
    """
    # Fetch user from the database by email
    statement = select(User).where(User.email == user.email)
    result = await db.execute(statement)
    db_user = result.scalars().first()

    if db_user is None or not verify_password(user.password, db_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    # Generate JWT access token on successful login
    access_token = create_access_token(
        data={"sub": db_user.email, "role": db_user.role}, expires_delta=timedelta(hours=1)
    )

    return {"access_token": access_token, "token_type": "bearer"}
