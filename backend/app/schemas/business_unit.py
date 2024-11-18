from pydantic import BaseModel
from typing import Optional

class BusinessUnitCreate(BaseModel):
    name: str
    location: str

    class Config:
        orm_mode = True

