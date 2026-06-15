from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import models
from routes.auth import get_current_user

router = APIRouter()

@router.get("")
def get_dashboard_metrics(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Total datasets
    total_datasets = db.query(models.Dataset).filter(models.Dataset.user_id == current_user.id).count()
    
    # We need to get all datasets for the user to count regions and warehouses
    user_datasets = db.query(models.Dataset).filter(models.Dataset.user_id == current_user.id).all()
    dataset_ids = [d.id for d in user_datasets]
    
    if not dataset_ids:
        return {
            "total_datasets": 0,
            "total_regions": 0,
            "total_resources": 0,
            "total_allocated": 0,
            "total_remaining": 0,
            "regions_served": 0,
            "coverage_percentage": 0.0,
            "recent_activity": []
        }

    total_regions = db.query(models.Region).filter(models.Region.dataset_id.in_(dataset_ids)).count()
    
    total_resources = db.query(func.sum(models.Warehouse.resources)).filter(models.Warehouse.dataset_id.in_(dataset_ids)).scalar() or 0
    
    # Get latest history for all datasets to aggregate
    histories = db.query(models.AllocationHistory).filter(models.AllocationHistory.user_id == current_user.id).order_by(models.AllocationHistory.created_at.desc()).all()
    
    total_remaining = 0
    total_allocated = 0
    
    # We aggregate based on latest history per dataset
    seen_datasets = set()
    latest_histories = []
    for h in histories:
        if h.dataset_id not in seen_datasets:
            seen_datasets.add(h.dataset_id)
            latest_histories.append(h)
            
    for h in latest_histories:
        total_remaining += h.resources_remaining
        # To get allocated, we need the associated result
        result = db.query(models.AllocationResult).filter(models.AllocationResult.dataset_id == h.dataset_id).order_by(models.AllocationResult.created_at.desc()).first()
        if result:
            allocs = result.analysis_data.get("allocations", [])
            total_allocated += sum(a["allocated"] for a in allocs)
            
    # Regions served across latest histories
    regions_served = 0
    total_demand = 0
    for h in latest_histories:
        result = db.query(models.AllocationResult).filter(models.AllocationResult.dataset_id == h.dataset_id).order_by(models.AllocationResult.created_at.desc()).first()
        if result:
            allocs = result.analysis_data.get("allocations", [])
            for a in allocs:
                total_demand += a["demand"]
                if a["status"] in ["Fulfilled", "Partial"]:
                    regions_served += 1
                    
    coverage = (total_allocated / total_demand * 100) if total_demand > 0 else 0.0
    
    recent_activity = []
    for h in histories[:5]: # top 5 recent
        dataset_name = h.dataset.name if h.dataset else "Unknown"
        recent_activity.append({
            "id": h.id,
            "dataset_name": dataset_name,
            "coverage": h.coverage_percentage,
            "created_at": h.created_at
        })
        
    return {
        "total_datasets": total_datasets,
        "total_regions": total_regions,
        "total_resources": total_resources,
        "total_allocated": total_allocated,
        "total_remaining": total_remaining,
        "regions_served": regions_served,
        "coverage_percentage": round(coverage, 2),
        "recent_activity": recent_activity
    }
