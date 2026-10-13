from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.models import User
from app.schemas.schemas import EmailAnalyzeRequest, EmailAnalyzeResponse, URLAnalyzeRequest, URLAnalyzeResponse
from app.security.auth import get_optional_user
from app.services.email_analysis_service import perform_full_email_analysis
from app.services.url_service import analyze_single_url

router = APIRouter(prefix="/api/analyze", tags=["Analysis"])

@router.post("/email", response_model=EmailAnalyzeResponse)
def analyze_email_endpoint(
    payload: EmailAnalyzeRequest,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Main email analysis endpoint:
    Processes sender, subject, body, extracted URLs, and headers using ML and NLP services.
    Returns prediction, risk score (0-100), risk level, and explainable indicators.
    """
    try:
        user_id = current_user.id if current_user else None
        res = perform_full_email_analysis(
            sender=payload.sender,
            subject=payload.subject,
            body=payload.body,
            reply_to=payload.reply_to,
            provided_urls=payload.urls,
            raw_headers=payload.raw_headers,
            user_id=user_id,
            db=db
        )
        return res
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to analyze the email. Internal error: {str(e)}"
        )

@router.post("/url", response_model=URLAnalyzeResponse)
def analyze_url_endpoint(payload: URLAnalyzeRequest):
    """
    Standalone static URL analysis endpoint.
    """
    try:
        report = analyze_single_url(payload.url)
        indicators = []
        for ind in report["indicators"]:
            indicators.append({
                "category": "URL",
                "severity": "HIGH" if report["risk_level"] in ["HIGH", "CRITICAL"] else "MEDIUM",
                "description": ind
            })
        return {
            "url": report["url"],
            "risk_score": report["risk_score"],
            "risk_level": report["risk_level"],
            "indicators": indicators
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid URL format or evaluation failure: {str(e)}"
        )
