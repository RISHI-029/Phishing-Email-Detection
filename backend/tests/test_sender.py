import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.sender_service import analyze_sender

def test_sender_lookalike_detection():
    sender = "security@paypa1-update.com"
    res = analyze_sender(sender)
    
    assert res["is_lookalike"] is True
    assert any("typosquatting" in ind["description"] for ind in res["indicators"])

def test_sender_reply_to_mismatch():
    sender = "support@paypal.com"
    reply_to = "collector@hacker-server.net"
    res = analyze_sender(sender, reply_to)
    
    assert res["reply_to_mismatch"] is True
    assert any("Reply-To" in ind["description"] for ind in res["indicators"])
