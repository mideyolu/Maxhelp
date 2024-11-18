from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.ext.asyncio import AsyncSession
from core.config import settings


DATABASE_URL = f"postgresql+asyncpg://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"

#create the async engine
engine = create_async_engine(DATABASE_URL, echo=True, future=True)


#use async_sessionmaker to create the async session
AsyncSessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)


#Dependency to get async session

async def get_session() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session
