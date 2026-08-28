import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["app"] == "JANBHASHA"

def test_login_admin():
    res = client.post("/api/auth/login", json={
        "identifier": "admin@janbhasha.local",
        "password": "Admin@1234",
        "role": "admin"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["data"]["role"] == "admin"
