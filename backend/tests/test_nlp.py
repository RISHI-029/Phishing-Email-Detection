import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.nlp_service import analyze_nlp_features

def test_nlp_urgency_detection():
    subject = "URGENT: Account Suspended Immediately!"
    body = "Your account will be closed in 24 hours unless you verify your identity."
    res = analyze_nlp_features(subject, body)
    
    assert "urgent" in res["nlp_keywords"] or "suspended" in res["nlp_keywords"]
    assert len(res["indicators"]) > 0
    assert any(ind["category"] == "LANGUAGE" for ind in res["indicators"])

def test_nlp_safe_text():
    subject = "Team Lunch Tomorrow"
    body = "Let's grab pizza tomorrow at noon."
    res = analyze_nlp_features(subject, body)
    
    assert len(res["nlp_keywords"]) == 0
    assert len(res["indicators"]) == 0
