from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import models
from routes.auth import get_current_user

router = APIRouter()

@router.get("/{dataset_id}")
def get_analysis(dataset_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id, models.Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    result = db.query(models.AllocationResult).filter(models.AllocationResult.dataset_id == dataset.id).order_by(models.AllocationResult.created_at.desc()).first()
    if not result:
        raise HTTPException(status_code=404, detail="No allocation result found for this dataset")
        
    data = result.analysis_data
    warehouse = data.get("warehouse", {})
    allocations = data.get("allocations", [])
    
    total_resources = warehouse.get("resources", 0)
    allocated_resources = sum(a["allocated"] for a in allocations)
    remaining_resources = total_resources - allocated_resources
    
    total_demand = sum(a["demand"] for a in allocations)
    coverage = (allocated_resources / total_demand) * 100 if total_demand > 0 else 100.0
    
    regions_served = sum(1 for a in allocations if a["status"] in ["Fulfilled", "Partial"])
    
    total_transport_cost = sum(a["distance"] * a["allocated"] for a in allocations)
    
    return {
        "total_resources": total_resources,
        "allocated_resources": allocated_resources,
        "remaining_resources": remaining_resources,
        "coverage_percentage": round(coverage, 2),
        "regions_served": regions_served,
        "total_transport_cost": round(total_transport_cost, 2),
        "dataset_name": dataset.name,
        "allocations": allocations
    }
