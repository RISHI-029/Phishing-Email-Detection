from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.models import EmailScan, Indicator, URLScan, User
from app.schemas.schemas import EmailScanSummary, EmailAnalyzeResponse, IndicatorSchema, URLScanSchema, SenderAnalysisSchema
from app.security.auth import get_optional_user
from app.services.sender_service import analyze_sender
from app.services.nlp_service import analyze_nlp_features

router = APIRouter(prefix="/api/scans", tags=["Scan History"])

@router.get("", response_model=List[EmailScanSummary])
def get_scans_history(
    query: Optional[str] = None,
    result_filter: Optional[str] = None, # PHISHING, SAFE, SUSPICIOUS
    sort_by: str = Query("date", regex="^(date|risk)$"),
    limit: int = 50,
    offset: int = 0,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves searchable and filterable history of email scans.
    """
    q = db.query(EmailScan)

    if current_user:
        # Show user's scans + unassigned public scans
        q = q.filter((EmailScan.user_id == current_user.id) | (EmailScan.user_id.is_(None)))

    if result_filter and result_filter.upper() != "ALL":
        q = q.filter(EmailScan.prediction == result_filter.upper())

    if query:
        search_pattern = f"%{query}%"
        q = q.filter(
            (EmailScan.subject.ilike(search_pattern)) |
            (EmailScan.sender.ilike(search_pattern))
        )

    if sort_by == "risk":
        q = q.order_by(EmailScan.risk_score.desc())
    else:
        q = q.order_by(EmailScan.created_at.desc())

    scans = q.offset(offset).limit(limit).all()
    return scans

@router.get("/{scan_id}", response_model=EmailAnalyzeResponse)
def get_scan_details(
    scan_id: int,
    db: Session = Depends(get_db)
):
    """
    Retrieves forensic analysis breakdown for a historical scan ID.
    """
    scan = db.query(EmailScan).filter(EmailScan.id == scan_id).first()
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scan report with ID {scan_id} not found."
        )

    indicators = db.query(Indicator).filter(Indicator.scan_id == scan_id).all()
    urls = db.query(URLScan).filter(URLScan.scan_id == scan_id).all()

    sender_res = analyze_sender(scan.sender, scan.reply_to, scan.subject, scan.body_preview or "")
    nlp_res = analyze_nlp_features(scan.subject, scan.body_preview or "")

    # Generate recommendation based on risk score
    if scan.risk_score >= 61:
        recommendation = "CRITICAL WARNING: High probability of phishing or credential harvesting attack. Do NOT click any links, open attachments, or provide passwords or sensitive information."
    elif scan.risk_score >= 31:
        recommendation = "SUSPICIOUS NOTICE: This email exhibits multiple suspicious indicators (e.g. urgent language or unverified sender). Exercise caution and verify sender identity via phone or secondary channel."
    else:
        recommendation = "LEGITIMATE: No significant phishing or malicious indicators detected. Safe to read, though standard security best practices still apply."

    return {
        "scan_id": scan.id,
        "prediction": scan.prediction,
        "confidence": scan.confidence,
        "risk_score": scan.risk_score,
        "risk_level": scan.risk_level,
        "indicators": [
            {
                "category": ind.category,
                "severity": ind.severity,
                "description": ind.description
            } for ind in indicators
        ],
        "urls": [
            {
                "url": u.url,
                "risk_score": u.risk_score,
                "risk_level": u.risk_level,
                "indicators": []
            } for u in urls
        ],
        "sender_analysis": sender_res,
        "header_analysis": {
            "spf": "Not available",
            "dkim": "Not available",
            "dmarc": "Not available",
            "from_header": scan.sender,
            "reply_to_header": scan.reply_to,
            "return_path": None,
            "hops_count": 0,
            "anomalies": []
        },
        "nlp_keywords": nlp_res["nlp_keywords"],
        "recommendation": recommendation,
        "created_at": scan.created_at
    }
