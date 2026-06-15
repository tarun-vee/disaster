from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class WarehouseBase(BaseModel):
    location_name: str
    resources: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class WarehouseCreate(WarehouseBase):
    pass

class Warehouse(WarehouseBase):
    id: int
    dataset_id: int

    class Config:
        orm_mode = True

class RegionBase(BaseModel):
    name: str
    severity: int
    demand: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class RegionCreate(RegionBase):
    pass

class Region(RegionBase):
    id: int
    dataset_id: int

    class Config:
        orm_mode = True

class DatasetBase(BaseModel):
    name: str
    json_data: Optional[Any] = None

class DatasetCreate(DatasetBase):
    pass

class Dataset(DatasetBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        orm_mode = True

class AllocationHistoryBase(BaseModel):
    total_cost: float
    resources_remaining: int
    coverage_percentage: float

class AllocationHistory(AllocationHistoryBase):
    id: int
    user_id: int
    dataset_id: int
    created_at: datetime

    class Config:
        orm_mode = True

class AllocationResultBase(BaseModel):
    analysis_data: Any

class AllocationResult(AllocationResultBase):
    id: int
    dataset_id: int
    created_at: datetime

    class Config:
        orm_mode = True
