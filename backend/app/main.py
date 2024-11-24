from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from core.config import settings
from db.init_db import init_db
from utils.utils import hash_password
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from db.models import User
from datetime import datetime
from db.session import AsyncSessionLocal
from api.endpoints import (
    auth,
    inventory,
    feedback,
    orders,
    notifications,
    financial_reports,
)
from sqlalchemy.exc import IntegrityError

async def create_admin_user(db: AsyncSession) -> bool:
    """
    Create an admin user from environment variables if not already present.
    """
    try:
        from sqlalchemy.future import select
        from utils.utils import hash_password

        # Fetch admin credentials from .env
        admin_name = settings.ADMIN_NAME
        admin_email = settings.ADMIN_EMAIL
        admin_password = settings.ADMIN_PASSWORD

        # Check if admin already exists
        statement = select(User).where(User.email == admin_email)
        result = await db.execute(statement)
        existing_admin = result.scalars().first()

        if existing_admin:
            return False  # Admin already exists

        # Create new admin user

        hashed_password = hash_password(admin_password)
        admin_user = User(
            name=admin_name,
            email=admin_email,
            password_hash=hashed_password,
            role="admin",
            unit_id=None,
            gender=None,
            created_at=datetime.utcnow()  # Explicitly set created_at if needed
        )

        db.add(admin_user)
        await db.commit()
        await db.refresh(admin_user)
        return True  # Admin created successfully
    except IntegrityError as e:
        print(f"Error creating admin user: {e}")
        return False


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manage application lifecycle events.
    """
    # Startup logic
    async with AsyncSessionLocal() as db:
        # Initialize the database
        await init_db()
        print("Database initialized")

        # Create admin user
        admin_created = await create_admin_user(db)
        if admin_created:
            print("Admin user created.")
        else:
            print("Admin user already exists.")

        yield

    # Shutdown logic (if needed)
    print("Application shutting down")



# Initialize FastAPI app
app = FastAPI(title="MaxHelp Backend", lifespan=lifespan)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(inventory.router, prefix="/inventory", tags=["Inventory"])
app.include_router(feedback.router, prefix="/feedback", tags=["Feedback"])
app.include_router(orders.router, prefix="/orders", tags=["Orders"])
app.include_router(
    notifications.router, prefix="/notifications", tags=["Notifications"]
)
app.include_router(
    financial_reports.router, prefix="/financial-reports", tags=["Financial Reports"]
)


# Root endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to MaxHelp Backend"}
