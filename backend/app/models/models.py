import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="user", nullable=False)  # "user" or "admin"
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    scans = relationship("EmailScan", back_populates="user", cascade="all, delete-orphan")

class EmailScan(Base):
    __tablename__ = "email_scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    sender = Column(String(255), nullable=False)
    reply_to = Column(String(255), nullable=True)
    subject = Column(String(500), nullable=False)
    body_preview = Column(Text, nullable=True)
    risk_score = Column(Integer, nullable=False)
    risk_level = Column(String(50), nullable=False) # LOW, MEDIUM, HIGH, CRITICAL
    prediction = Column(String(50), nullable=False) # PHISHING, SAFE, SUSPICIOUS
    confidence = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="scans")
    indicators = relationship("Indicator", back_populates="scan", cascade="all, delete-orphan")
    urls = relationship("URLScan", back_populates="scan", cascade="all, delete-orphan")

class Indicator(Base):
    __tablename__ = "indicators"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("email_scans.id"), nullable=False)
    category = Column(String(50), nullable=False) # SENDER, URL, LANGUAGE, HEADER
    severity = Column(String(50), nullable=False) # HIGH, MEDIUM, LOW
    description = Column(Text, nullable=False)

    scan = relationship("EmailScan", back_populates="indicators")

class URLScan(Base):
    __tablename__ = "urls"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("email_scans.id"), nullable=False)
    url = Column(Text, nullable=False)
    risk_score = Column(Integer, nullable=False)
    risk_level = Column(String(50), nullable=False)

    scan = relationship("EmailScan", back_populates="urls")

class ModelMetric(Base):
    __tablename__ = "model_metrics"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), nullable=False)
    accuracy = Column(Float, nullable=False)
    precision = Column(Float, nullable=False)
    recall = Column(Float, nullable=False)
    f1_score = Column(Float, nullable=False)
    trained_at = Column(DateTime, default=datetime.datetime.utcnow)
