import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field

# ----------------- Auth Schemas -----------------

class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: str = Field(default="user", pattern="^(user|admin)$")
    admin_secret: Optional[str] = None  # Required when registering as admin

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    is_active: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class AdminUserSummary(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    is_active: bool
    scan_count: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class UserRoleUpdateRequest(BaseModel):
    role: str = Field(..., pattern="^(user|admin)$")

class UserStatusUpdateRequest(BaseModel):
    is_active: bool

# ----------------- Analysis Schemas -----------------

class IndicatorSchema(BaseModel):
    category: str  # SENDER, URL, LANGUAGE, HEADER
    severity: str  # HIGH, MEDIUM, LOW
    description: str

    class Config:
        from_attributes = True

class URLScanSchema(BaseModel):
    url: str
    risk_score: int
    risk_level: str
    indicators: Optional[List[str]] = []

    class Config:
        from_attributes = True

class SenderAnalysisSchema(BaseModel):
    sender_email: str
    domain: str
    is_valid_syntax: bool
    is_free_provider: bool
    is_lookalike: bool
    reply_to_mismatch: bool
    details: List[str]

class HeaderAnalysisSchema(BaseModel):
    spf: str = "Not available"
    dkim: str = "Not available"
    dmarc: str = "Not available"
    from_header: Optional[str] = None
    reply_to_header: Optional[str] = None
    return_path: Optional[str] = None
    hops_count: int = 0
    anomalies: List[str] = []

class EmailAnalyzeRequest(BaseModel):
    sender: str
    reply_to: Optional[str] = None
    subject: str
    body: str
    urls: Optional[List[str]] = None
    raw_headers: Optional[str] = None

class EmailAnalyzeResponse(BaseModel):
    scan_id: Optional[int] = None
    prediction: str # SAFE, PHISHING, SUSPICIOUS
    confidence: float
    risk_score: int # 0-100
    risk_level: str # LOW, MEDIUM, HIGH, CRITICAL
    indicators: List[IndicatorSchema]
    urls: List[URLScanSchema]
    sender_analysis: SenderAnalysisSchema
    header_analysis: Optional[HeaderAnalysisSchema] = None
    nlp_keywords: List[str] = []
    recommendation: str
    created_at: Optional[datetime.datetime] = None

class URLAnalyzeRequest(BaseModel):
    url: str

class URLAnalyzeResponse(BaseModel):
    url: str
    risk_score: int
    risk_level: str
    indicators: List[IndicatorSchema]

# ----------------- History & Dashboard -----------------

class EmailScanSummary(BaseModel):
    id: int
    sender: str
    subject: str
    risk_score: int
    risk_level: str
    prediction: str
    confidence: float
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class DashboardStatsResponse(BaseModel):
    total_scans: int
    phishing_count: int
    safe_count: int
    suspicious_count: int
    average_risk_score: float
    monthly_trend: List[Dict[str, Any]]
    risk_distribution: Dict[str, int]
    recent_scans: List[EmailScanSummary]

class ModelMetricsResponse(BaseModel):
    best_model: str
    selected_metrics: Dict[str, Any]
    all_models: Dict[str, Any]
    dataset_info: Dict[str, int]
