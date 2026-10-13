import re
from urllib.parse import urlparse
from typing import List, Dict, Any

SUSPICIOUS_TLDS = {".tk", ".xyz", ".top", ".click", ".gq", ".cf", ".ml", ".ga", ".work", ".men", ".party", ".space"}
SHORTENER_DOMAINS = {"bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd", "buff.ly", "ow.ly", "tiny.cc"}
SENSITIVE_PATH_KEYWORDS = ["login", "verify", "account", "bank", "update", "secure", "signin", "reset", "auth", "confirm", "portal"]

def extract_urls(text: str) -> List[str]:
    """
    Regex extractor to collect HTTP/HTTPS URLs from text body.
    """
    if not text:
        return []
    url_pattern = r'https?://[^\s<>"]+|www\.[^\s<>"]+'
    urls = re.findall(url_pattern, text)
    cleaned_urls = []
    for u in urls:
        # Strip trailing punctuation
        u = u.rstrip(".,);:!]")
        if u not in cleaned_urls:
            cleaned_urls.append(u)
    return cleaned_urls

def analyze_single_url(url: str) -> Dict[str, Any]:
    """
    Performs static feature analysis on a single URL.
    Does NOT execute HTTP requests.
    """
    risk_score = 0
    indicators = []
    
    parsed = urlparse(url if url.startswith("http") else f"http://{url}")
    domain = parsed.netloc.lower()
    path = parsed.path.lower()
    query = parsed.query.lower()
    full_url = url.lower()
    
    # 1. Scheme Check (HTTP vs HTTPS)
    if parsed.scheme == "http":
        risk_score += 15
        indicators.append("Insecure HTTP protocol used (no TLS encryption).")
        
    # 2. IP Address in Hostname
    ip_pattern = r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$'
    if re.match(ip_pattern, domain):
        risk_score += 35
        indicators.append("URL hostname uses a raw IP address instead of a domain name.")

    # 3. URL Length
    if len(full_url) > 75:
        risk_score += 15
        indicators.append(f"Excessively long URL ({len(full_url)} characters).")

    # 4. Dot Count
    dot_count = domain.count('.')
    if dot_count > 3:
        risk_score += 15
        indicators.append(f"Excessive subdomains/dots in hostname ({dot_count} dots).")

    # 5. Hyphen Count
    hyphen_count = domain.count('-')
    if hyphen_count >= 2:
        risk_score += 15
        indicators.append(f"Multiple hyphens in domain name ({hyphen_count} hyphens).")

    # 6. URL Shortener Service
    if any(shortener in domain for shortener in SHORTENER_DOMAINS):
        risk_score += 25
        indicators.append("URL shortener service detected (masks true destination).")

    # 7. Suspicious TLD
    if any(domain.endswith(tld) for tld in SUSPICIOUS_TLDS):
        risk_score += 25
        indicators.append("Domain uses a high-risk suspicious top-level domain (TLD).")

    # 8. Sensitive Keywords in Path/Query
    found_keywords = [kw for kw in SENSITIVE_PATH_KEYWORDS if kw in path or kw in query]
    if found_keywords:
        risk_score += 20
        indicators.append(f"Sensitive authentication keywords found in URL path: {', '.join(found_keywords)}.")

    # 9. Lookalike digits in domain (e.g., paypa1, micros0ft, g00gle)
    if re.search(r'(paypa1|micros0ft|g00gle|g0gle|app1e|amaz0n|b0fa)', domain):
        risk_score += 35
        indicators.append("Domain contains a lookalike brand spelling pattern.")

    # Cap score at 100
    risk_score = min(100, risk_score)
    
    # Risk Level Mapping
    if risk_score <= 30:
        risk_level = "LOW"
    elif risk_score <= 60:
        risk_level = "MEDIUM"
    elif risk_score <= 80:
        risk_level = "HIGH"
    else:
        risk_level = "CRITICAL"

    return {
        "url": url,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "indicators": indicators
    }

def analyze_urls_in_email(email_body: str, provided_urls: List[str] = None) -> Dict[str, Any]:
    """
    Extracts and evaluates all URLs in an email.
    Returns list of URL risk reports and global URL risk metric.
    """
    extracted = extract_urls(email_body or "")
    all_urls = list(set((provided_urls or []) + extracted))
    
    reports = [analyze_single_url(u) for u in all_urls]
    
    max_url_risk = max([r["risk_score"] for r in reports], default=0)
    
    url_indicators = []
    for r in reports:
        if r["risk_score"] > 30:
            severity = "HIGH" if r["risk_level"] in ["HIGH", "CRITICAL"] else "MEDIUM"
            for ind in r["indicators"]:
                url_indicators.append({
                    "category": "URL",
                    "severity": severity,
                    "description": f"[{r['url'][:35]}...] {ind}"
                })

    return {
        "url_reports": reports,
        "max_url_risk": max_url_risk,
        "indicators": url_indicators
    }
