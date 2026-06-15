import requests
import math
import time

def get_coordinates(location_name: str) -> tuple[float, float]:
    """
    Returns (latitude, longitude) for a given location using Nominatim.
    Returns (0.0, 0.0) if not found or on error.
    """
    url = f"https://nominatim.openstreetmap.org/search?q={location_name}&format=json"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json"
    }
    try:
        response = requests.get(url, headers=headers, timeout=5)
        response.raise_for_status()
        data = response.json()
        if data and len(data) > 0:
            return float(data[0]["lat"]), float(data[0]["lon"])
    except Exception as e:
        print(f"Geocoding failed for {location_name}: {e}")
    return 0.0, 0.0

def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance in kilometers between two points
    on the earth (specified in decimal degrees).
    """
    # Convert decimal degrees to radians
    lon1, lat1, lon2, lat2 = map(math.radians, [lon1, lat1, lon2, lat2])

    # Haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    r = 6371 # Radius of earth in kilometers
    return c * r

def get_road_distance(lat1, lon1, lat2, lon2) -> float:
    """
    Returns the driving distance in kilometers using OSRM API.
    Falls back to Haversine if OSRM fails.
    """
    url = f"http://router.project-osrm.org/route/v1/driving/{lon1},{lat1};{lon2},{lat2}?overview=false"
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
        if data.get("code") == "Ok" and len(data.get("routes", [])) > 0:
            # Distance is returned in meters, convert to km
            return data["routes"][0]["distance"] / 1000.0
    except Exception as e:
        print(f"OSRM failed: {e}. Falling back to Haversine.")
        
    return haversine_distance(lat1, lon1, lat2, lon2)
