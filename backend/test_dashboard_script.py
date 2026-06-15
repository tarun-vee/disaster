import requests
import json
import time

datasets = [
    {
        "dataset_name": "Chennai Flood Scenario",
        "warehouse": { "location": "Chennai", "resources": 8000 },
        "regions": [
            { "name": "T Nagar", "severity": 9, "demand": 1200 },
            { "name": "Velachery", "severity": 8, "demand": 1000 }
        ]
    },
    {
        "dataset_name": "Mumbai Cyclone Scenario",
        "warehouse": { "location": "Mumbai", "resources": 15000 },
        "regions": [
            { "name": "Colaba", "severity": 10, "demand": 5000 },
            { "name": "Bandra", "severity": 8, "demand": 3000 },
            { "name": "Andheri", "severity": 9, "demand": 4000 }
        ]
    },
    {
        "dataset_name": "Bangalore Landslide Scenario",
        "warehouse": { "location": "Bangalore", "resources": 5000 },
        "regions": [
            { "name": "Whitefield", "severity": 7, "demand": 2000 },
            { "name": "Electronic City", "severity": 8, "demand": 3500 }
        ]
    }
]

def run():
    print("Logging in...")
    r = requests.post('http://localhost:8000/api/auth/login', json={'email':'testuser4@example.com', 'password':'Password123'})
    token = r.json().get('access_token')
    h = {'Authorization': f'Bearer {token}'}

    for idx, ds_data in enumerate(datasets):
        print(f"\n--- Processing {ds_data['dataset_name']} ---")
        ds = requests.post('http://localhost:8000/api/datasets/upload', json=ds_data, headers=h).json()
        dataset_id = ds['id']
        print(f"Uploaded with ID: {dataset_id}")
        
        print("Running allocation...")
        alloc_req = requests.post(f'http://localhost:8000/api/allocation/{dataset_id}', headers=h)
        if alloc_req.status_code != 200:
            print("Allocation failed:", alloc_req.text)
            continue
            
        alloc = alloc_req.json()
        print(f"Allocated successfully. Coverage: {alloc['summary']['coverage_percentage']}%")
        print(f"Transport Cost: {alloc['summary'].get('total_transport_cost')}")

    print("\n--- Verifying Dashboard Metrics ---")
    dash = requests.get('http://localhost:8000/api/dashboard', headers=h).json()
    print("Dashboard Response:")
    print(json.dumps(dash, indent=2))
    
    print("\n--- Verifying History ---")
    hist = requests.get('http://localhost:8000/api/history', headers=h).json()
    print(f"History count: {len(hist)}")

if __name__ == "__main__":
    run()
