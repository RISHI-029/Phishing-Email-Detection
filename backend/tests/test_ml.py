import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ml")))

from ml.preprocessing import clean_text, preprocess_email_text
from ml.predict import predict_email

def test_clean_text():
    raw = "<b>URGENT!</b> Check http://example.com now."
    cleaned = clean_text(raw)
    assert "urgent" in cleaned
    assert "urltoken" in cleaned
    assert "<" not in cleaned

def test_ml_prediction_run():
    subject = "URGENT: Verify Your Account"
    body = "Click http://paypa1-update.com/login immediately to verify your identity."
    pred, conf = predict_email(subject, body)
    
    assert pred in ["PHISHING", "SAFE", "SUSPICIOUS"]
    assert 0.0 <= conf <= 1.0
