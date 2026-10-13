import re
from typing import List, Dict, Any

# Suspicious keyword dictionaries with associated severity weights
URGENCY_KEYWORDS = [
    "urgent", "immediately", "immediate action required", "account suspended", 
    "restricted", "24 hours", "12 hours", "action required", "final notice",
    "expire today", "expiring", "suspended", "termination warning", "locked"
]

CREDENTIAL_KEYWORDS = [
    "verify your account", "update password", "confirm identity", "login to view",
    "reset your password", "security verification", "social security", "seed phrase",
    "credentials", "enter bank details", "sign in"
]

FINANCIAL_KEYWORDS = [
    "wire transfer", "gift card", "refund", "claim prize", "claim reward",
    "payment failed", "custom duty", "unclaimed tax", "direct deposit",
    "credit card", "crypto", "metamask", "dollar"
]

def analyze_nlp_features(subject: str, body: str) -> Dict[str, Any]:
    """
    Scans subject and body for suspicious social engineering indicators and keywords.
    Returns detected keywords and generated indicators.
    """
    text = f"{subject or ''} {body or ''}".lower()
    
    detected_keywords = []
    indicators = []
    
    # 1. Urgency Language Detection
    matched_urgency = [kw for kw in URGENCY_KEYWORDS if kw in text]
    if matched_urgency:
        detected_keywords.extend(matched_urgency)
        indicators.append({
            "category": "LANGUAGE",
            "severity": "HIGH" if any(w in matched_urgency for w in ["immediately", "suspended", "24 hours", "final notice"]) else "MEDIUM",
            "description": f"Urgent or coercive language detected: '{', '.join(matched_urgency[:3])}'."
        })
        
    # 2. Credential Harvesting Pattern
    matched_cred = [kw for kw in CREDENTIAL_KEYWORDS if kw in text]
    if matched_cred:
        detected_keywords.extend(matched_cred)
        indicators.append({
            "category": "LANGUAGE",
            "severity": "HIGH",
            "description": f"Credential verification request detected: '{', '.join(matched_cred[:3])}'."
        })

    # 3. Financial Coercion / Reward Claims
    matched_fin = [kw for kw in FINANCIAL_KEYWORDS if kw in text]
    if matched_fin:
        detected_keywords.extend(matched_fin)
        indicators.append({
            "category": "LANGUAGE",
            "severity": "MEDIUM",
            "description": f"Financial or reward claim language detected: '{', '.join(matched_fin[:3])}'."
        })
        
    # 4. Excessive Capitalization in Subject Line
    if subject and len(subject) > 5 and sum(1 for c in subject if c.isupper()) / len(subject) > 0.4:
        indicators.append({
            "category": "LANGUAGE",
            "severity": "LOW",
            "description": "Excessive capitalization detected in subject line (often used to excite urgency)."
        })

    return {
        "nlp_keywords": list(set(detected_keywords)),
        "indicators": indicators
    }
