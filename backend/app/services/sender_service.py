import re
from typing import Dict, Any, List

FREE_EMAIL_PROVIDERS = {"gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com", "icloud.com", "mail.com", "protonmail.com"}
BRAND_PATTERNS = {
    r'paypa1': "PayPal",
    r'micros0ft': "Microsoft",
    r'g00gle': "Google",
    r'g0gle': "Google",
    r'amaz0n': "Amazon",
    r'app1e': "Apple",
    r'b0fa': "Bank of America",
    r'netfl1x': "Netflix"
}

def parse_domain(email_str: str) -> str:
    """Extracts domain from email address."""
    if not email_str or "@" not in email_str:
        return ""
    return email_str.split("@")[-1].strip().lower()

def analyze_sender(sender: str, reply_to: str = None, subject: str = "", body: str = "") -> Dict[str, Any]:
    """
    Analyzes sender email address and reply-to headers for spoofing, lookalikes, and mismatches.
    """
    indicators: List[Dict[str, str]] = []
    details: List[str] = []
    
    sender_clean = sender.strip().lower() if sender else ""
    
    # 1. Syntax check
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    is_valid_syntax = bool(re.match(email_regex, sender_clean))
    
    if not is_valid_syntax:
        indicators.append({
            "category": "SENDER",
            "severity": "HIGH",
            "description": f"Sender email format '{sender}' is invalid or malformed."
        })
        details.append("Invalid email syntax.")
        
    sender_domain = parse_domain(sender_clean)
    reply_to_domain = parse_domain(reply_to) if reply_to else ""
    
    is_free_provider = sender_domain in FREE_EMAIL_PROVIDERS
    is_lookalike = False
    reply_to_mismatch = False
    
    # 2. Lookalike domain check
    for pattern, brand in BRAND_PATTERNS.items():
        if re.search(pattern, sender_domain):
            is_lookalike = True
            indicators.append({
                "category": "SENDER",
                "severity": "HIGH",
                "description": f"Sender domain '{sender_domain}' contains a lookalike typosquatting pattern for brand '{brand}'."
            })
            details.append(f"Typosquatting pattern for {brand}.")
            break

    # 3. Free provider claiming official status
    text_content = f"{subject} {body}".lower()
    if is_free_provider:
        for brand in ["paypal", "microsoft", "apple", "amazon", "bank", "security department"]:
            if brand in text_content and brand not in sender_domain:
                indicators.append({
                    "category": "SENDER",
                    "severity": "MEDIUM",
                    "description": f"Email claims to represent {brand.title()} but was sent from a free email provider ({sender_domain})."
                })
                details.append("Free email address claiming corporate affiliation.")
                break

    # 4. Reply-To mismatch
    if reply_to_domain and reply_to_domain != sender_domain:
        reply_to_mismatch = True
        indicators.append({
            "category": "SENDER",
            "severity": "HIGH",
            "description": f"Reply-To domain '{reply_to_domain}' does not match From domain '{sender_domain}'."
        })
        details.append("Reply-To address mismatch detected.")

    return {
        "sender_email": sender,
        "domain": sender_domain,
        "is_valid_syntax": is_valid_syntax,
        "is_free_provider": is_free_provider,
        "is_lookalike": is_lookalike,
        "reply_to_mismatch": reply_to_mismatch,
        "details": details,
        "indicators": indicators
    }
