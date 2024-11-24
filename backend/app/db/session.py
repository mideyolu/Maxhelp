from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.ext.asyncio import AsyncSession
from core.config import settings




# create the async engine
engine = create_async_engine(settings.DATABASE_URL, echo=True, future=True)


# use async_sessionmaker to create the async session
AsyncSessionLocal = async_sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)


# Dependency to get async session

from typing import AsyncGenerator


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
