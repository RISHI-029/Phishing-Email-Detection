import sys
import os
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

# Add ml path to sys.path so predict module can be imported
SYS_ML_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "ml"))
if SYS_ML_PATH not in sys.path:
    sys.path.insert(0, SYS_ML_PATH)

from predict import predict_email
from app.services.nlp_service import analyze_nlp_features
from app.services.url_service import analyze_urls_in_email
from app.services.sender_service import analyze_sender
from app.services.header_service import analyze_raw_headers
from app.models.models import EmailScan, Indicator, URLScan

def perform_full_email_analysis(
    sender: str,
    subject: str,
    body: str,
    reply_to: Optional[str] = None,
    provided_urls: Optional[list] = None,
    raw_headers: Optional[str] = None,
    user_id: Optional[int] = None,
    db: Optional[Session] = None
) -> Dict[str, Any]:
    """
    Orchestrates full cybersecurity scan on email payload:
    1. ML Model classification & confidence score
    2. NLP threat language extraction
    3. Static URL feature analysis
    4. Sender domain anomaly & lookalike inspection
    5. Raw header authentication check
    6. Calculated Risk Score (0-100) & Risk Level classification
    7. Database persistence
    """
    # 1. Run Machine Learning Model Prediction
    ml_prediction, ml_confidence = predict_email(subject, body)
    
    # 2. Run Security Feature Services
    nlp_res = analyze_nlp_features(subject, body)
    url_res = analyze_urls_in_email(body, provided_urls)
    sender_res = analyze_sender(sender, reply_to, subject, body)
    header_res = analyze_raw_headers(raw_headers)
    
    # Combine all indicators
    all_indicators = []
    all_indicators.extend(sender_res.get("indicators", []))
    all_indicators.extend(url_res.get("indicators", []))
    all_indicators.extend(nlp_res.get("indicators", []))
    all_indicators.extend(header_res.get("indicators", []))
    
    # 3. Calculate Risk Score (0 - 100)
    
    ml_risk_component = (ml_confidence * 40) if ml_prediction == "PHISHING" else ((1.0 - ml_confidence) * 20)
    
    
    url_risk_component = (url_res.get("max_url_risk", 0) / 100.0) * 30.0
    
    
    sender_risk_component = 0
    if sender_res["is_lookalike"]:
        sender_risk_component += 10
    if sender_res["reply_to_mismatch"]:
        sender_risk_component += 5
    if not sender_res["is_valid_syntax"]:
        sender_risk_component += 5
        
    
    indicator_severity_sum = 0
    for ind in all_indicators:
        if ind["severity"] == "HIGH":
            indicator_severity_sum += 5
        elif ind["severity"] == "MEDIUM":
            indicator_severity_sum += 3
        elif ind["severity"] == "LOW":
            indicator_severity_sum += 1
            
    heuristics_component = min(15.0, indicator_severity_sum)
    
    total_calculated_risk = int(round(ml_risk_component + url_risk_component + sender_risk_component + heuristics_component))
    final_risk_score = max(0, min(100, total_calculated_risk))
    
    # Determine Final Prediction & Risk Level
    if final_risk_score <= 30:
        risk_level = "LOW"
        prediction = "SAFE"
    elif final_risk_score <= 60:
        risk_level = "MEDIUM"
        prediction = "SUSPICIOUS"
    elif final_risk_score <= 80:
        risk_level = "HIGH"
        prediction = "PHISHING"
    else:
        risk_level = "CRITICAL"
        prediction = "PHISHING"
        
    # Generate Actionable Recommendation
    if final_risk_score >= 61:
        recommendation = "CRITICAL WARNING: High probability of phishing or credential harvesting attack. Do NOT click any links, open attachments, or provide passwords or sensitive information."
    elif final_risk_score >= 31:
        recommendation = "SUSPICIOUS NOTICE: This email exhibits multiple suspicious indicators (e.g. urgent language or unverified sender). Exercise caution and verify sender identity via phone or secondary channel."
    else:
        recommendation = "LEGITIMATE: No significant phishing or malicious indicators detected. Safe to read, though standard security best practices still apply."

    scan_payload = {
        "prediction": prediction,
        "confidence": round(float(ml_confidence), 4),
        "risk_score": final_risk_score,
        "risk_level": risk_level,
        "indicators": all_indicators,
        "urls": url_res["url_reports"],
        "sender_analysis": sender_res,
        "header_analysis": header_res,
        "nlp_keywords": nlp_res["nlp_keywords"],
        "recommendation": recommendation
    }

    # 4. Save Scan Report into Database if DB Session is active
    if db is not None:
        db_scan = EmailScan(
            user_id=user_id,
            sender=sender,
            reply_to=reply_to,
            subject=subject,
            body_preview=body[:200] if body else "",
            risk_score=final_risk_score,
            risk_level=risk_level,
            prediction=prediction,
            confidence=round(float(ml_confidence), 4)
        )
        db.add(db_scan)
        db.commit()
        db.refresh(db_scan)
        
        
        for ind in all_indicators:
            db_ind = Indicator(
                scan_id=db_scan.id,
                category=ind["category"],
                severity=ind["severity"],
                description=ind["description"]
            )
            db.add(db_ind)
            
        
        for u in url_res["url_reports"]:
            db_url = URLScan(
                scan_id=db_scan.id,
                url=u["url"],
                risk_score=u["risk_score"],
                risk_level=u["risk_level"]
            )
            db.add(db_url)
            
        db.commit()
        scan_payload["scan_id"] = db_scan.id
        scan_payload["created_at"] = db_scan.created_at

    return scan_payload
