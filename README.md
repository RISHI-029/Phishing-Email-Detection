# AI-Based Phishing Email Detection and Risk Analysis System

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688.svg?style=flat&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.4.0-F7931E.svg?style=flat&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind--CSS-3.4-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An enterprise-grade, MCA-level major project providing end-to-end phishing email classification, static threat analysis, explainable security indicators, and interactive risk scoring.

---

## 1. Project Overview & Problem Statement

Phishing attacks remain one of the primary vectors for enterprise cybersecurity breaches. Traditional signature-based detection mechanisms often miss zero-day spear-phishing campaigns and social engineering tactics.

This application provides a defensive cybersecurity solution combining **Machine Learning (TF-IDF + Multi-Model Classification)** with **NLP static feature extraction**, **URL heuristic evaluation**, and **Sender anomaly analysis** to calculate a precise **Risk Score (0–100)** with **explainable security indicators**.

---

## 2. Features

- **Multi-Model Machine Learning**: Compares Logistic Regression, Random Forest, and Linear Support Vector Machines (SVM) on TF-IDF feature matrices and deploys the highest-performing model.
- **Explainable Threat Indicators**: Displays categorized security badges (HIGH, MEDIUM, LOW severity) explaining *why* an email was flagged (e.g., lookalike domain, urgency language, HTTP URL, IP host).
- **Static URL Analysis**: Analyzes extracted links for suspicious characteristics (subdomains, hyphens, IP addresses, shortening services, suspicious keywords) without visiting malicious destinations.
- **Sender & Domain Anomaly Detection**: Checks for Reply-To mismatches, free provider usage, syntax errors, and leetspeak lookalike patterns (e.g., `paypa1.com`).
- **Interactive Security Dashboard**: Real-time stats, threat breakdown charts (Phishing vs Safe, Risk Distribution), and recent scan logs powered by Recharts.
- **Scan History & Detailed Reports**: Searchable, filterable audit log of historical email scans with complete forensic drill-down.
- **Model Evaluation Page**: Visualizes real ML training performance metrics (Accuracy, Precision, Recall, F1-Score, Confusion Matrix).
- **JWT Authentication & SQLite DB**: Secure registration, password hashing (`passlib`/`bcrypt`), protected API routes, and SQLAlchemy ORM storage.

---

## 3. Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React icons, Recharts, Axios, React Router v6.
- **Backend**: Python 3.10+, FastAPI, Uvicorn, Pydantic v2, SQLAlchemy ORM.
- **Machine Learning & NLP**: Scikit-Learn, Pandas, NumPy, NLTK, Joblib.
- **Database**: SQLite (SQLAlchemy models ready for PostgreSQL migration).
- **DevOps**: Docker & Docker Compose, Pytest.

---

## 4. Architecture

```text
React Frontend (Vite + Tailwind) ──[ REST API / JWT ]──> FastAPI Backend
                                                                │
                 ┌──────────────────────────────────────────────┴──────────────────────────────┐
                 ▼                                              ▼                              ▼
        SQLite Database                                security Services                ML Predictor
 (Users, Scans, Indicators, URLs)                   (URL Heuristics, Sender, NLP)      (TF-IDF + Classifier)
```

For detailed system design, see [docs/architecture.md](docs/architecture.md).

---

## 5. Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and `npm`

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/ai-phishing-detector.git
cd ai-phishing-detector
```

### Step 2: Set Up Backend & Train ML Model
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Train the ML models using data/dataset.csv (replace the starter sample with a licensed public corpus; see data/README.md)
python ml/train_model.py

# Run FastAPI server
uvicorn app.main:app --reload --port 8000
```

The FastAPI backend will run on `http://localhost:8000`. API Documentation is available at `http://localhost:8000/docs`.

### Step 3: Set Up Frontend
```bash
# In a new terminal window, navigate to frontend directory
cd frontend

# Install node dependencies
npm install

# Start Vite development server
npm run dev
```

The React app will run on `http://localhost:5173`.

---

## 6. Testing

Run automated tests for Auth, NLP, URL heuristics, ML prediction, and API endpoints:

```bash
cd backend
pytest tests/
```

---

## 7. Project Structure

```text
ai-phishing-detector/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── security/
│   │   ├── routes/
│   │   └── services/
│   ├── ml/
│   │   ├── preprocessing.py
│   │   ├── feature_extraction.py
│   │   ├── train_model.py
│   │   ├── predict.py
│   │   └── models/
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── context/
│   └── package.json
├── data/
│   └── dataset.csv
├── docs/
│   ├── architecture.md
│   ├── api.md
│   └── ml_pipeline.md
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 8. Limitations & Future Enhancements

### Limitations
- Static Heuristics: URL analysis is static to prevent unsafe network traffic.
- Dataset Size: Development version includes sample dataset; production deployment requires training on larger datasets (e.g., Nazario / PhishTank corpus).

### Future Roadmap
- BERT / Transformer model fine-tuning for deep semantic understanding.
- Live API integration with VirusTotal & PhishTank domain reputation services.
- Browser extension & Outlook / Gmail add-in integration.
- Attachment sandboxing and static file parsing.
