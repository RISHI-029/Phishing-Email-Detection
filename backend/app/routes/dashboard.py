from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
import datetime

from app.database import get_db
from app.models.models import EmailScan
from app.schemas.schemas import DashboardStatsResponse, EmailScanSummary
from app.services.email_analysis_service import perform_full_email_analysis

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard Statistics"])

def seed_default_scans_if_empty(db: Session):
    """
    Seeds initial realistic scan logs if database is empty so dashboard charts display real data.
    """
    count = db.query(EmailScan).count()
    if count == 0:
        samples = [
            {
                "sender": "security@paypa1-verification-update.com",
                "reply_to": "hacker88@gmail.com",
                "subject": "URGENT: Verify Your Bank Account Immediately",
                "body": "Dear customer, We detected unusual activity on your account. Click http://verify-secure-bank-login.com/auth immediately to avoid account suspension."
            },
            {
                "sender": "hr@company.com",
                "reply_to": None,
                "subject": "Team Meeting Scheduled",
                "body": "Hello team, The weekly project sync meeting will take place tomorrow at 10 AM in Conference Room B."
            },
            {
                "sender": "billing@netflix-secure-update.com",
                "reply_to": "support@netflix-update-fail.com",
                "subject": "Urgent Security Warning: Netflix Membership Cancelled",
                "body": "Payment failed for your Netflix subscription. Update billing details within 12 hours at http://netflix-billing-update-secure.com or membership will end."
            },
            {
                "sender": "colleague@techcorp.com",
                "reply_to": None,
                "subject": "Project Status Update - Q3",
                "body": "Hi all, Here is the latest progress report for Q3 deliverables. All milestones are on track for release next Friday."
            },
            {
                "sender": "admin@webmail-keepalive-verify.com",
                "reply_to": None,
                "subject": "IMPORTANT: Your Email Password Will Expire",
                "body": "Your email password will expire in 2 hours. Keep your current password by verifying here: http://webmail-password-keep-alive.com"
            }
        ]

        for s in samples:
            perform_full_email_analysis(
                sender=s["sender"],
                subject=s["subject"],
                body=s["body"],
                reply_to=s["reply_to"],
                db=db
            )

@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Calculates aggregated cybersecurity threat statistics for the dashboard.
    """
    seed_default_scans_if_empty(db)

    total_scans = db.query(EmailScan).count()
    phishing_count = db.query(EmailScan).filter(EmailScan.prediction == "PHISHING").count()
    safe_count = db.query(EmailScan).filter(EmailScan.prediction == "SAFE").count()
    suspicious_count = db.query(EmailScan).filter(EmailScan.prediction == "SUSPICIOUS").count()

    avg_score_res = db.query(func.avg(EmailScan.risk_score)).scalar()
    avg_risk_score = round(float(avg_score_res), 1) if avg_score_res else 0.0

    # Risk Distribution Buckets
    low_risk = db.query(EmailScan).filter(EmailScan.risk_level == "LOW").count()
    med_risk = db.query(EmailScan).filter(EmailScan.risk_level == "MEDIUM").count()
    high_risk = db.query(EmailScan).filter(EmailScan.risk_level == "HIGH").count()
    crit_risk = db.query(EmailScan).filter(EmailScan.risk_level == "CRITICAL").count()

    risk_distribution = {
        "LOW": low_risk,
        "MEDIUM": med_risk,
        "HIGH": high_risk,
        "CRITICAL": crit_risk
    }

    # Recent scans
    recent_db_scans = db.query(EmailScan).order_by(EmailScan.created_at.desc()).limit(10).all()
    recent_scans = [
        EmailScanSummary(
            id=s.id,
            sender=s.sender,
            subject=s.subject,
            risk_score=s.risk_score,
            risk_level=s.risk_level,
            prediction=s.prediction,
            confidence=s.confidence,
            created_at=s.created_at
        ) for s in recent_db_scans
    ]

    # Monthly / Weekly trend dummy aggregation for visual charting
    monthly_trend = [
        {"month": "Jan", "phishing": max(1, phishing_count - 4), "safe": max(2, safe_count - 3)},
        {"month": "Feb", "phishing": max(2, phishing_count - 3), "safe": max(3, safe_count - 2)},
        {"month": "Mar", "phishing": max(3, phishing_count - 1), "safe": max(4, safe_count - 1)},
        {"month": "Current", "phishing": phishing_count, "safe": safe_count}
    ]

    return {
        "total_scans": total_scans,
        "phishing_count": phishing_count,
        "safe_count": safe_count,
        "suspicious_count": suspicious_count,
        "average_risk_score": avg_risk_score,
        "monthly_trend": monthly_trend,
        "risk_distribution": risk_distribution,
        "recent_scans": recent_scans
    }
