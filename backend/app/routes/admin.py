from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.models import User, EmailScan
from app.schemas.schemas import AdminUserSummary, UserRoleUpdateRequest, UserStatusUpdateRequest, EmailScanSummary
from app.security.auth import require_admin

router = APIRouter(prefix="/api/admin", tags=["Admin Panel"])


@router.get("/users", response_model=List[AdminUserSummary])
def admin_list_all_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """
    [Admin Only] Returns all registered users with scan counts.
    """
    users = db.query(User).order_by(User.created_at.desc()).all()
    result = []
    for u in users:
        scan_count = db.query(EmailScan).filter(EmailScan.user_id == u.id).count()
        result.append(AdminUserSummary(
            id=u.id,
            name=u.name,
            email=u.email,
            role=u.role,
            is_active=u.is_active,
            scan_count=scan_count,
            created_at=u.created_at
        ))
    return result


@router.patch("/users/{user_id}/role")
def admin_update_user_role(
    user_id: int,
    body: UserRoleUpdateRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """
    [Admin Only] Change the role of a user (user <-> admin).
    """
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot change your own role.")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    user.role = body.role
    db.commit()
    return {"message": f"User {user.email} role updated to {body.role}."}


@router.patch("/users/{user_id}/status")
def admin_toggle_user_status(
    user_id: int,
    body: UserStatusUpdateRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """
    [Admin Only] Activate or deactivate a user account.
    """
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot change your own status.")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    user.is_active = body.is_active
    db.commit()
    return {"message": f"User {user.email} status set to {'active' if body.is_active else 'inactive'}."}


@router.get("/scans", response_model=List[EmailScanSummary])
def admin_list_all_scans(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """
    [Admin Only] Returns ALL email scans across all users.
    """
    scans = db.query(EmailScan).order_by(EmailScan.created_at.desc()).limit(200).all()
    return scans


@router.delete("/scans/{scan_id}")
def admin_delete_scan(
    scan_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """
    [Admin Only] Delete a specific scan record permanently.
    """
    scan = db.query(EmailScan).filter(EmailScan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found.")
    db.delete(scan)
    db.commit()
    return {"message": f"Scan #{scan_id} deleted successfully."}


@router.get("/stats")
def admin_system_stats(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """
    [Admin Only] System-wide statistics: total users, total scans, role breakdown.
    """
    total_users = db.query(User).count()
    admin_count = db.query(User).filter(User.role == "admin").count()
    user_count = db.query(User).filter(User.role == "user").count()
    active_users = db.query(User).filter(User.is_active == True).count()
    total_scans = db.query(EmailScan).count()
    phishing_count = db.query(EmailScan).filter(EmailScan.prediction == "PHISHING").count()

    return {
        "total_users": total_users,
        "admin_count": admin_count,
        "user_count": user_count,
        "active_users": active_users,
        "total_scans": total_scans,
        "phishing_count": phishing_count
    }
