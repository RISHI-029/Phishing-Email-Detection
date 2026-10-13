from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.config import settings
from app.database import engine, Base
from app.routes import auth, analyze, scans, dashboard, metrics, admin

# Initialize Database Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Enterprise Defensive Cybersecurity AI System for Phishing Email Detection & Threat Scoring",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(analyze.router)
app.include_router(scans.router)
app.include_router(dashboard.router)
app.include_router(metrics.router)
app.include_router(admin.router)

@app.get("/api/health", tags=["Health"])
def health_check():
    """
    Health check endpoint returning API operational status.
    """
    return {
        "status": "online",
        "system": settings.PROJECT_NAME,
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
