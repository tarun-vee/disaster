import requests

url = "http://localhost:8000/api/auth/register"
data = {
    "full_name": "Test User",
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
}
response = requests.post(url, json=data)
print(response.status_code)
print(response.text)
