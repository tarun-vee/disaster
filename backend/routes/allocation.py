from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import models
from schemas import schemas
from routes.auth import get_current_user
from services.geocoding import get_coordinates, get_road_distance
from algorithms.dijkstra import Graph, dijkstra
from algorithms.allocation import run_allocation
import time

router = APIRouter()

@router.post("/{dataset_id}")
def trigger_allocation(dataset_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id, models.Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    warehouses = db.query(models.Warehouse).filter(models.Warehouse.dataset_id == dataset.id).all()
    if not warehouses:
        raise HTTPException(status_code=400, detail="No warehouse found in dataset")
    warehouse = warehouses[0] # assuming 1 warehouse for simplicity based on schema
    
    regions = db.query(models.Region).filter(models.Region.dataset_id == dataset.id).all()
    if not regions:
        raise HTTPException(status_code=400, detail="No regions found in dataset")
        
    # 1. Geocoding
    if not warehouse.latitude or not warehouse.longitude:
        lat, lon = get_coordinates(warehouse.location_name)
        warehouse.latitude = lat
        warehouse.longitude = lon
        db.commit()
        time.sleep(1) # respect Nominatim rate limit
        
    for r in regions:
        if not r.latitude or not r.longitude:
            lat, lon = get_coordinates(r.name)
            r.latitude = lat
            r.longitude = lon
            db.commit()
            time.sleep(1)
            
    # 2 & 3. Distance Calculation & Graph Construction
    g = Graph()
    g.add_node(f"W_{warehouse.id}")
    
    for r in regions:
        g.add_node(f"R_{r.id}")
        dist = get_road_distance(warehouse.latitude, warehouse.longitude, r.latitude, r.longitude)
        g.add_edge(f"W_{warehouse.id}", f"R_{r.id}", dist)
        
    # 4. Dijkstra
    distances, path = dijkstra(g, f"W_{warehouse.id}")
    
    # 5 & 6. Priority Queue and Allocation
    regions_data = []
    for r in regions:
        d = distances.get(f"R_{r.id}", float('inf'))
        regions_data.append({
            "region_id": r.id,
            "name": r.name,
            "severity": r.severity,
            "demand": r.demand,
            "distance": round(d, 2),
            "latitude": r.latitude,
            "longitude": r.longitude
        })
        
    allocation_output = run_allocation(warehouse.resources, regions_data)
    
    # 7. Database Storage
    # AllocationResult
    result = models.AllocationResult(
        dataset_id=dataset.id,
        analysis_data={
            "warehouse": {
                "id": warehouse.id,
                "location_name": warehouse.location_name,
                "latitude": warehouse.latitude,
                "longitude": warehouse.longitude,
                "resources": warehouse.resources
            },
            "allocations": allocation_output["allocations"]
        }
    )
    db.add(result)
    
    # AllocationHistory
    # calculate coverage %
    total_demand = sum(r.demand for r in regions)
    coverage = (allocation_output["total_allocated"] / total_demand) * 100 if total_demand > 0 else 100.0
    
    # calculate total transport cost
    total_transport_cost = 0.0
    for alloc in allocation_output["allocations"]:
        total_transport_cost += alloc["distance"] * alloc["allocated"]
        
    history = models.AllocationHistory(
        user_id=current_user.id,
        dataset_id=dataset.id,
        total_cost=round(total_transport_cost, 2),
        resources_remaining=allocation_output["remaining_resources"],
        coverage_percentage=round(coverage, 2)
    )
    db.add(history)
    db.commit()
    db.refresh(result)
    
    return {
        "message": "Allocation completed successfully",
        "result_id": result.id,
        "data": result.analysis_data,
        "summary": {
            "total_allocated": allocation_output["total_allocated"],
            "remaining_resources": allocation_output["remaining_resources"],
            "coverage_percentage": round(coverage, 2),
            "total_transport_cost": round(total_transport_cost, 2)
        }
    }
