import heapq

def run_allocation(warehouse_resources: int, regions_data: list):
    """
    regions_data is a list of dicts:
    {
        "region_id": int,
        "name": str,
        "severity": int,
        "demand": int,
        "distance": float
    }
    """
    
    # Priority Queue Rules:
    # 1. Higher Severity First (Since heapq is min-heap, we use -severity)
    # 2. Lower Distance Second
    
    pq = []
    for r in regions_data:
        # Tuple: (-severity, distance, demand, region_id, name, latitude, longitude)
        heapq.heappush(pq, (-r["severity"], r["distance"], r["demand"], r["region_id"], r["name"], r.get("latitude"), r.get("longitude")))
        
    remaining_resources = warehouse_resources
    allocations = []
    
    # Create a sorted list based on heap pops to process in exact priority order
    ordered_queue = []
    while pq:
        ordered_queue.append(heapq.heappop(pq))
        
    for item in ordered_queue:
        neg_sev, dist, demand, r_id, name, lat, lon = item
        severity = -neg_sev
        
        if remaining_resources >= demand:
            allocated = demand
            status = "Fulfilled"
            remaining_resources -= demand
        elif remaining_resources > 0:
            allocated = remaining_resources
            status = "Partial"
            remaining_resources = 0
        else:
            allocated = 0
            status = "Out Of Stock"
            
        allocations.append({
            "region_id": r_id,
            "name": name,
            "severity": severity,
            "demand": demand,
            "distance": dist,
            "allocated": allocated,
            "status": status,
            "latitude": lat,
            "longitude": lon
        })
        
    return {
        "allocations": allocations,
        "remaining_resources": remaining_resources,
        "total_allocated": warehouse_resources - remaining_resources
    }
