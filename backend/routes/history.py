from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import models
from routes.auth import get_current_user

router = APIRouter()

@router.get("")
def get_history(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    histories = db.query(models.AllocationHistory).filter(models.AllocationHistory.user_id == current_user.id).order_by(models.AllocationHistory.created_at.desc()).all()
    
    res = []
    for h in histories:
        dataset_name = h.dataset.name if h.dataset else "Unknown Dataset"
        
        # We need the result id to load it
        # The result was created closely in time to history for the same dataset
        # In a more robust system, history should have a foreign key to result, but we can query it
        result = db.query(models.AllocationResult).filter(models.AllocationResult.dataset_id == h.dataset_id).order_by(models.AllocationResult.created_at.desc()).first()
        
        res.append({
            "id": h.id,
            "dataset_id": h.dataset_id,
            "dataset_name": dataset_name,
            "total_cost": h.total_cost,
            "resources_remaining": h.resources_remaining,
            "coverage_percentage": h.coverage_percentage,
            "created_at": h.created_at,
            "result_id": result.id if result else None
        })
    return res

@router.get("/{result_id}")
def get_history_result(result_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    result = db.query(models.AllocationResult).filter(models.AllocationResult.id == result_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
        
    # Verify user owns dataset
    dataset = db.query(models.Dataset).filter(models.Dataset.id == result.dataset_id, models.Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    return result.analysis_data

@router.delete("/{history_id}")
def delete_history(history_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    history = db.query(models.AllocationHistory).filter(models.AllocationHistory.id == history_id, models.AllocationHistory.user_id == current_user.id).first()
    if not history:
        raise HTTPException(status_code=404, detail="History not found")
        
    # Also delete the associated AllocationResult for this dataset created around the same time.
    # Since we can't perfectly match without FK, we will just delete the latest result for that dataset
    # Or keep it simple: we can delete ALL results for that dataset if we want to reset it,
    # but let's just delete the history record. The user can re-run safely.
    # Actually, let's delete the result that shares the same dataset id to keep DB clean.
    results = db.query(models.AllocationResult).filter(models.AllocationResult.dataset_id == history.dataset_id).all()
    for r in results:
        db.delete(r)
        
    db.delete(history)
    db.commit()
    return {"message": "History deleted successfully"}
