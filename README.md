# AI-Based Phishing Email Detection and Risk Analysis System

An AI-powered cybersecurity project that detects potential phishing emails using Machine Learning, Natural Language Processing (NLP), static URL analysis, and sender anomaly detection. The system generates risk scores and explainable threat indicators through an interactive dashboard.

## Features

- **Machine Learning Detection:** Compares Logistic Regression, Random Forest, and Linear SVM models using TF-IDF features.
- **Email Threat Analysis:** Analyzes email content and sender information for suspicious patterns.
- **URL Risk Analysis:** Identifies potentially suspicious URLs using static heuristics, including IP-based hosts, URL shorteners, suspicious keywords, and unusual domain structures.
- **Sender Anomaly Detection:** Checks Reply-To mismatches, lookalike domains, and other suspicious sender characteristics.
- **Risk Scoring:** Generates a risk score from 0–100 with severity classifications and explainable indicators.
- **Security Dashboard:** Displays threat statistics, risk distributions, scan history, and detailed analysis reports.
- **Authentication:** Uses JWT authentication and password hashing to protect application routes.
- **Scan History:** Stores scan records and security findings for later review.

## Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React, Vite, Tailwind CSS, Recharts |
| Backend | Python, FastAPI, Uvicorn |
| Machine Learning | scikit-learn, TF-IDF |
| NLP & Data Processing | NLTK, pandas, NumPy |
| Database | SQLite, SQLAlchemy |
| Authentication | JWT, password hashing |
| Testing & Deployment | pytest, Docker, Docker Compose |

## System Architecture

1. The user submits email content and related sender or URL information.
2. The backend extracts relevant text and security indicators.
3. The ML model classifies the email, while static heuristics analyze URLs and sender anomalies.
4. The application combines analysis signals into a risk assessment with explainable indicators.
5. The dashboard displays the results and maintains scan history.

## Security Use Case

This project demonstrates defensive cybersecurity concepts related to phishing detection, suspicious-link analysis, threat triage, and explainable risk assessment.

URL analysis uses static characteristics rather than intentionally visiting suspicious destinations.

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/RISHI-029/Phishing-Email-Detection.git
cd Phishing-Email-Detection
```

### 2. Set Up the Backend

```bash
cd backend
python -m venv venv
```

Activate the virtual environment.

**Windows**
```bash
venv\Scripts\activate
```

**Linux/macOS**
```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Train the models:

```bash
python ml/train_model.py
```

Start the API:

```bash
uvicorn app.main:app --reload --port 8000
```

API documentation: http://localhost:8000/docs

### 3. Set Up the Frontend

Open another terminal from the project root directory:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed in your terminal.

Refer to the project configuration and environment-variable instructions for any additional setup required.

## Testing

Run the backend tests from the backend directory:

```bash
pytest
```

## Limitations

- Detection quality depends on the training dataset and the diversity of phishing examples.
- Results should be treated as risk indicators, not definitive proof that an email is malicious or safe.
- The included illustrative dataset is small and is not sufficient to establish real-world detection performance.
- Further evaluation on representative datasets is needed before production use.

## Future Improvements

- Evaluate models on larger, publicly available phishing datasets.
- Improve detection of obfuscated URLs and impersonation attempts.
- Add more comprehensive evaluation and false-positive analysis.
- Explore integration with security monitoring and incident-response workflows.

## Author

**Rishikesh Gawali**

MCA Student | Aspiring Cybersecurity Analyst

- GitHub: [RISHI-029](https://github.com/RISHI-029)
- LinkedIn: [Rishikesh Gawali](https://www.linkedin.com/in/rishikesh-gawali/)
