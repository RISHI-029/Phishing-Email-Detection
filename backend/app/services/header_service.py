import re
from typing import Dict, Any, List

def analyze_raw_headers(raw_headers: str) -> Dict[str, Any]:
    """
    Parses raw email header block to extract authentication tokens (SPF, DKIM, DMARC)
    and header anomalies.
    """
    if not raw_headers or not raw_headers.strip():
        return {
            "spf": "Not available",
            "dkim": "Not available",
            "dmarc": "Not available",
            "from_header": None,
            "reply_to_header": None,
            "return_path": None,
            "hops_count": 0,
            "anomalies": [],
            "indicators": []
        }

    headers_lower = raw_headers.lower()
    indicators: List[Dict[str, str]] = []
    anomalies: List[str] = []

    # 1. SPF Check
    spf = "Not available"
    if "spf=pass" in headers_lower:
        spf = "PASS"
    elif "spf=fail" in headers_lower or "spf=softfail" in headers_lower:
        spf = "FAIL"
        indicators.append({
            "category": "HEADER",
            "severity": "HIGH",
            "description": "Email SPF authentication check failed."
        })
        anomalies.append("SPF Failure")
    elif "spf=" in headers_lower:
        spf = "NEUTRAL"

    # 2. DKIM Check
    dkim = "Not available"
    if "dkim=pass" in headers_lower:
        dkim = "PASS"
    elif "dkim=fail" in headers_lower:
        dkim = "FAIL"
        indicators.append({
            "category": "HEADER",
            "severity": "HIGH",
            "description": "Email DKIM cryptographic signature verification failed."
        })
        anomalies.append("DKIM Failure")

    # 3. DMARC Check
    dmarc = "Not available"
    if "dmarc=pass" in headers_lower:
        dmarc = "PASS"
    elif "dmarc=fail" in headers_lower:
        dmarc = "FAIL"
        indicators.append({
            "category": "HEADER",
            "severity": "HIGH",
            "description": "Email DMARC domain alignment check failed."
        })
        anomalies.append("DMARC Failure")

    
    from_match = re.search(r'^from:\s*(.+)$', raw_headers, re.MULTILINE | re.IGNORECASE)
    reply_to_match = re.search(r'^reply-to:\s*(.+)$', raw_headers, re.MULTILINE | re.IGNORECASE)
    return_path_match = re.search(r'^return-path:\s*(.+)$', raw_headers, re.MULTILINE | re.IGNORECASE)

    from_header = from_match.group(1).strip() if from_match else None
    reply_to_header = reply_to_match.group(1).strip() if reply_to_match else None
    return_path = return_path_match.group(1).strip() if return_path_match else None

    # Count Received hops
    received_count = len(re.findall(r'^received:', raw_headers, re.MULTILINE | re.IGNORECASE))

    return {
        "spf": spf,
        "dkim": dkim,
        "dmarc": dmarc,
        "from_header": from_header,
        "reply_to_header": reply_to_header,
        "return_path": return_path,
        "hops_count": received_count,
        "anomalies": anomalies,
        "indicators": indicators
    }
