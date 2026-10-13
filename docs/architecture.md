# System Architecture Document

## 1. Overview

The **AI-Based Phishing Email Detection and Risk Analysis System** is an enterprise-grade defensive cybersecurity solution designed to evaluate emails for phishing threats using Machine Learning, Natural Language Processing (NLP), static URL analysis, and sender anomaly detection.

```
                    +-----------------------------+
                    |    React + Vite Frontend    |
                    |  (Tailwind, Recharts UI)    |
                    +--------------+--------------+
                                   |
                                   | REST API (JSON / JWT)
                                   v
                    +-----------------------------+
                    |     FastAPI Backend API     |
                    +--------------+--------------+
                                   |
    +------------------------------+------------------------------+
    |                              |                              |
    v                              v                              v
+------------------+     +-------------------+          +-------------------+
| Auth & DB Layer  |     | Cyber Analysis    |          |  ML Predictor     |
| (SQLAlchemy/     |     | - NLP Keyword Heur|          | - Preprocessing   |
|  SQLite DB)      |     | - Static URL Eval |          | - TF-IDF Vector   |
|                  |     | - Sender Lookalike|          | - Best Classifier |
|                  |     | - Header Parsing  |          | - Confidence %    |
+------------------+     +-------------------+          +-------------------+
                                   |
                                   v
                        +--------------------+
                        | Combined Risk Engine|
                        | (0-100 Score &     |
                        | Explainable Badges)|
                        +--------------------+
```

---

## 2. Component Breakdown

### A. Frontend Layer (React / Vite / Tailwind)
- **Single Page Application (SPA)** with client-side routing via React Router.
- State management via React Context (`AuthContext`).
- Visualization powered by `Recharts` for interactive threat analytics and distribution pie/bar charts.
- Dark cybersecurity glassmorphism design system.

### B. Backend Layer (FastAPI / Pydantic)
- **FastAPI**: Asynchronous Python Web Framework offering high throughput, auto-generated OpenAPI documentation, and strict type safety.
- **Security**: JWT OAuth2 Password Bearer flow, `passlib` with `bcrypt` password hashing.
- **REST APIs**: Endpoints for Authentication, Email Analysis, URL Analysis, Scan History, Dashboard Statistics, and ML Evaluation Metrics.

### C. ML Engine & Security Analysis
- **NLP Preprocessor**: Text normalization, tokenization, NLTK stop-word filtration, and lemmatization.
- **Feature Extraction**: `TfidfVectorizer` converting email subject + body text into numerical feature matrices.
- **Multi-Model Evaluator**: Trains Logistic Regression, Random Forest, and Linear SVM models, selecting the top performer based on F1-Score / Accuracy.
- **Static Heuristic Engine**: Evaluates extracted URLs (length, dots, hyphens, subdomains, IP hosts, shortening services, suspicious keywords) and Sender anomalies (lookalikes like `paypa1`, free email provider flags, Reply-To mismatches).
- **Risk Score Aggregator**: Combines ML prediction confidence with heuristic severity penalties into an intuitive 0–100 risk score categorized into LOW (0-30), MEDIUM (31-60), HIGH (61-80), and CRITICAL (81-100).

---

## 3. Database Schema

- **`users`**: User registration & credentials (`id`, `name`, `email`, `password_hash`, `created_at`).
- **`email_scans`**: Recorded email scan reports (`id`, `user_id`, `sender`, `reply_to`, `subject`, `risk_score`, `risk_level`, `prediction`, `confidence`, `created_at`).
- **`indicators`**: Detailed security indicators for a scan (`id`, `scan_id`, `category`, `severity`, `description`).
- **`urls`**: Extracted URLs analysis log (`id`, `scan_id`, `url`, `risk_score`, `risk_level`).
- **`model_metrics`**: ML training evaluation record (`id`, `model_name`, `accuracy`, `precision`, `recall`, `f1_score`, `trained_at`).
