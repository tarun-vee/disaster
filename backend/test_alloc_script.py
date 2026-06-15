import requests
import json
import time

def run_test():
    print("Logging in...")
    r = requests.post('http://localhost:8000/api/auth/login', json={'email':'testuser4@example.com', 'password':'Password123'})
    token = r.json().get('access_token')
    h = {'Authorization': f'Bearer {token}'}

    print("Uploading dataset...")
    with open('test_allocation.json') as f:
        payload = json.load(f)
    
    ds = requests.post('http://localhost:8000/api/datasets/upload', json=payload, headers=h).json()
    dataset_id = ds['id']
    print(f"Dataset created with ID: {dataset_id}")

    print("Running allocation... This will take a few seconds due to Geocoding limits.")
    start_time = time.time()
    alloc_req = requests.post(f'http://localhost:8000/api/allocation/{dataset_id}', headers=h)
    
    if alloc_req.status_code != 200:
        print("Allocation failed:", alloc_req.text)
        return
        
    alloc = alloc_req.json()
    print(f"Allocation completed in {round(time.time() - start_time, 2)}s")
    
    print("\n--- SUMMARY ---")
    print("Total Allocated:", alloc['summary']['total_allocated'])
    print("Remaining Resources:", alloc['summary']['remaining_resources'])
    print("Coverage:", alloc['summary']['coverage_percentage'], "%")
    
    print("\n--- ALLOCATIONS ---")
    allocations = alloc['data']['allocations']
    for a in allocations:
        print(f"[{a['status']}] {a['name']} (Sev: {a['severity']}, Dist: {a['distance']}km): Demand {a['demand']}, Allocated {a['allocated']}")
        
    print("\n--- WAREHOUSE ---")
    print(alloc['data']['warehouse'])

if __name__ == "__main__":
    run_test()
