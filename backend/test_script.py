import requests
import json

r = requests.post('http://localhost:8000/api/auth/login', json={'email':'testuser4@example.com', 'password':'Password123'})
token = r.json().get('access_token')
h = {'Authorization': f'Bearer {token}'}

ds = requests.post('http://localhost:8000/api/datasets', json={'name': 'Manual Test'}, headers=h).json()
id = ds['id']

requests.post(f'http://localhost:8000/api/datasets/{id}/warehouses', json={'location_name':'W1', 'resources':100}, headers=h)
requests.post(f'http://localhost:8000/api/datasets/{id}/regions', json={'name':'R1', 'severity':5, 'demand':50}, headers=h)

ds_get = requests.get(f'http://localhost:8000/api/datasets/{id}', headers=h).json()
print('MANUAL WAREHOUSE:', ds_get['warehouses'][0]['location_name'])
print('MANUAL REGION:', ds_get['regions'][0]['name'])

requests.delete(f'http://localhost:8000/api/datasets/{id}', headers=h)

with open('test_upload.json') as f:
    payload = json.load(f)

up = requests.post('http://localhost:8000/api/datasets/upload', json=payload, headers=h).json()
print('UPLOAD:', up.get('name', up))

ds_list = requests.get('http://localhost:8000/api/datasets', headers=h).json()
print('LIST:', [d['name'] for d in ds_list])
