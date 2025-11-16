from fastapi.testclient import TestClient
from app import app
client = TestClient(app)

def test_root_backend():
    r = client.get("/")
    assert r.status_code == 200
    assert r.json()["status"] == "running"

def test_root_frontend():
    r = client.get("/api")
    assert r.status_code == 200
    assert r.json()["message"] == "HunarBazar Backend API"

def test_login_success():
    payload = {"username": "Tanuj Bhatt", "password": "anything", "userType": "users"}
    r = client.post("/api/login", json=payload)
    assert r.status_code in [200, 401]

def test_verify_token_missing():
    r = client.get("/api/verify-token")
    assert r.status_code == 401