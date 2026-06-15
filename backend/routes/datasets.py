from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Any
from pydantic import BaseModel
from database import get_db
from models import models
from schemas import schemas
from routes.auth import get_current_user

router = APIRouter()

class UploadWarehouse(BaseModel):
    location: str
    resources: int

class UploadRegion(BaseModel):
    name: str
    severity: int
    demand: int

class DatasetUploadPayload(BaseModel):
    dataset_name: str
    warehouse: UploadWarehouse
    regions: List[UploadRegion]

@router.get("", response_model=List[schemas.Dataset])
def get_datasets(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Dataset).filter(models.Dataset.user_id == current_user.id).all()

@router.post("", response_model=schemas.Dataset)
def create_dataset(dataset: schemas.DatasetCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    new_dataset = models.Dataset(name=dataset.name, user_id=current_user.id, json_data=dataset.json_data)
    db.add(new_dataset)
    db.commit()
    db.refresh(new_dataset)
    return new_dataset

@router.get("/{dataset_id}")
def get_dataset(dataset_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id, models.Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    warehouses = db.query(models.Warehouse).filter(models.Warehouse.dataset_id == dataset.id).all()
    regions = db.query(models.Region).filter(models.Region.dataset_id == dataset.id).all()
    
    return {
        "id": dataset.id,
        "name": dataset.name,
        "created_at": dataset.created_at,
        "warehouses": warehouses,
        "regions": regions
    }

@router.delete("/{dataset_id}")
def delete_dataset(dataset_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id, models.Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    db.delete(dataset)
    db.commit()
    return {"message": "Dataset deleted successfully"}

@router.post("/{dataset_id}/warehouses", response_model=schemas.Warehouse)
def add_warehouse(dataset_id: int, warehouse: schemas.WarehouseCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id, models.Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    new_warehouse = models.Warehouse(
        dataset_id=dataset.id,
        location_name=warehouse.location_name,
        resources=warehouse.resources,
        latitude=warehouse.latitude,
        longitude=warehouse.longitude
    )
    db.add(new_warehouse)
    db.commit()
    db.refresh(new_warehouse)
    return new_warehouse

@router.post("/{dataset_id}/regions", response_model=schemas.Region)
def add_region(dataset_id: int, region: schemas.RegionCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id, models.Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    new_region = models.Region(
        dataset_id=dataset.id,
        name=region.name,
        severity=region.severity,
        demand=region.demand,
        latitude=region.latitude,
        longitude=region.longitude
    )
    db.add(new_region)
    db.commit()
    db.refresh(new_region)
    return new_region

@router.post("/upload", response_model=schemas.Dataset)
def upload_dataset(payload: DatasetUploadPayload, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # 1. Create dataset
    new_dataset = models.Dataset(name=payload.dataset_name, user_id=current_user.id)
    db.add(new_dataset)
    db.commit()
    db.refresh(new_dataset)
    
    # 2. Add warehouse
    new_warehouse = models.Warehouse(
        dataset_id=new_dataset.id,
        location_name=payload.warehouse.location,
        resources=payload.warehouse.resources
    )
    db.add(new_warehouse)
    
    # 3. Add regions
    for r in payload.regions:
        new_region = models.Region(
            dataset_id=new_dataset.id,
            name=r.name,
            severity=r.severity,
            demand=r.demand
        )
        db.add(new_region)
        
    db.commit()
    db.refresh(new_dataset)
    return new_dataset
