import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_supported_languages():
    res = client.get("/api/translate/languages")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert len(data["data"]["languages"]) >= 6

def test_translate_passthrough():
    res = client.post("/api/translate/translate", json={
        "text": "नमस्ते",
        "source_lang": "hi",
        "target_lang": "hi"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["data"]["translated_text"] == "नमस्ते"

def test_translate_dictionary_fallback():
    res = client.post("/api/translate/translate", json={
        "text": "नमस्ते",
        "source_lang": "hi",
        "target_lang": "sat"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "translated_text" in data["data"]
