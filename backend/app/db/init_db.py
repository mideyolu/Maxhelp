# In init_db.py
from .session import engine
from .models import SQLModel

async def init_db():
    async with engine.begin() as conn:
        # This will drop all tables and recreate them
       # await conn.run_sync(SQLModel.metadata.drop_all)
        await conn.run_sync(SQLModel.metadata.create_all)  # Ensure tables are created
