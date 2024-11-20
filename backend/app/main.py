from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from core.config import settings
from db.init_db import init_db
from utils.utils import hash_password
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from db.models import User
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


async def create_admin_user(db: AsyncSession):
    """
    Create admin user using environment variables.
    """
    try:
        # Fetch admin credentials from .env
        admin_name = settings.ADMIN_NAME
        admin_email = settings.ADMIN_EMAIL
        admin_password = settings.ADMIN_PASSWORD

        # Check if the admin already exists
        statement = select(User).where(User.email == admin_email)
        result = await db.execute(statement)
        existing_admin = result.scalars().first()

        if not existing_admin:
            # Create the admin user if not exists
            hashed_password = hash_password(admin_password)
            admin_user = User(
                name=admin_name,
                email=admin_email,  # Admin email
                password_hash=hashed_password,
                role="admin",  # Role as admin
                unit_id=None,
            )
            db.add(admin_user)
            await db.commit()
            await db.refresh(admin_user)
            print("Admin user created.")
        else:
            print("Admin user already exists.")
    except IntegrityError as e:
        # Handle duplicate admin creation
        print(f"Error creating admin user: {e.orig}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manage application lifecycle events.
    """
    # Startup logic
    async with AsyncSessionLocal() as db:
        await init_db()  # Initialize database
        print("Database initialized")
        await create_admin_user(db)  # Pass db session here to create the admin user
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
