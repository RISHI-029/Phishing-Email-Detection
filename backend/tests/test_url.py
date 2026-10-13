import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.url_service import analyze_single_url, extract_urls

def test_url_extraction():
    text = "Check this http://paypa1-update.com/login and www.example.com"
    urls = extract_urls(text)
    assert "http://paypa1-update.com/login" in urls

def test_static_url_analysis_phishing():
    url = "http://192.168.1.1/paypa1-verify/login.php?user=123"
    res = analyze_single_url(url)
    
    assert res["risk_score"] >= 60
    assert res["risk_level"] in ["HIGH", "CRITICAL"]
    assert any("raw IP address" in ind for ind in res["indicators"])

def test_static_url_analysis_safe():
    url = "https://www.google.com"
    res = analyze_single_url(url)
    assert res["risk_score"] <= 30
    assert res["risk_level"] == "LOW"
