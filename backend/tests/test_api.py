import pytest
import sys
import os
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app

client = TestClient(app)

def test_health_check_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"

def test_analyze_email_api():
    payload = {
        "sender": "security@paypa1-update.com",
        "subject": "URGENT: Verify Your Account",
        "body": "Click http://paypa1-update.com/login immediately to verify your identity.",
        "urls": ["http://paypa1-update.com/login"]
    }
    response = client.post("/api/analyze/email", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "prediction" in data
    assert "risk_score" in data
    assert data["risk_score"] > 50

def test_dashboard_stats_api():
    response = client.get("/api/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_scans" in data
    assert "risk_distribution" in data
