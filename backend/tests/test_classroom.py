import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_create_session():
    res = client.post(
        "/api/classroom/create",
        json={"subject": "Mathematics"},
        headers={"X-Teacher-Id": "1"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "session_id" in data["data"]
    assert "qr_data" in data["data"]
