# REST API Documentation

Base URL: `http://localhost:8000/api`

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Creates a new user account.
- **Request Body**:
```json
{
  "name": "Security Analyst",
  "email": "analyst@company.com",
  "password": "SecurePassword123!"
}
```
- **Response** `(201 Created)`:
```json
{
  "id": 1,
  "name": "Security Analyst",
  "email": "analyst@company.com",
  "created_at": "2026-08-08T12:00:00Z"
}
```

### `POST /api/auth/login`
Authenticates user and returns JWT bearer token.
- **Request Body**: `application/x-www-form-urlencoded` or JSON with `username` (email) and `password`.
- **Response** `(200 OK)`:
```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "name": "Security Analyst",
    "email": "analyst@company.com"
  }
}
```

---

## 2. Cybersecurity Analysis Endpoints

### `POST /api/analyze/email`
Performs comprehensive ML prediction, NLP feature extraction, URL heuristics, and sender inspection on an email.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "sender": "security@paypa1-update.com",
  "reply_to": "hacker@gmail.com",
  "subject": "URGENT: Verify Your Account",
  "body": "Your account has been restricted. Click http://paypa1-update.com/login immediately to verify your identity.",
  "urls": ["http://paypa1-update.com/login"],
  "raw_headers": "From: security@paypa1-update.com\nReply-To: hacker@gmail.com\nReceived: from unknown (192.168.1.1)"
}
```
- **Response** `(200 OK)`:
```json
{
  "prediction": "PHISHING",
  "confidence": 0.94,
  "risk_score": 92,
  "risk_level": "CRITICAL",
  "indicators": [
    {
      "category": "SENDER",
      "severity": "HIGH",
      "description": "Domain contains a lookalike spelling pattern (paypa1)."
    },
    {
      "category": "URL",
      "severity": "HIGH",
      "description": "Suspicious URL domain structure detected."
    },
    {
      "category": "LANGUAGE",
      "severity": "MEDIUM",
      "description": "Urgency-related language detected in subject/body."
    }
  ],
  "urls": [
    {
      "url": "http://paypa1-update.com/login",
      "risk_score": 85,
      "risk_level": "CRITICAL"
    }
  ],
  "sender_analysis": {
    "domain": "paypa1-update.com",
    "is_lookalike": true,
    "reply_to_mismatch": true
  },
  "nlp_keywords": ["urgent", "verify", "restricted", "account"],
  "recommendation": "Do not click any links or provide credentials. Report this message to your security team."
}
```

### `POST /api/analyze/url`
Performs standalone static security evaluation on a single URL.
- **Request Body**:
```json
{
  "url": "http://192.168.1.1/login/verify.php?session=abc"
}
```

---

## 3. History & Dashboard Statistics

### `GET /api/scans`
Lists scan history for the authenticated user with search, filtering, and sorting.
- **Query Params**: `query`, `result_filter` (PHISHING/SAFE/SUSPICIOUS), `sort_by` (date/risk), `limit`, `offset`.

### `GET /api/scans/{id}`
Retrieves full details for a specific historical scan.

### `GET /api/dashboard/stats`
Fetches aggregate threat intelligence statistics (total scans, phishing count, safe count, average risk score, monthly trends).

### `GET /api/model/metrics`
Returns evaluation metrics (Accuracy, Precision, Recall, F1-Score, Confusion Matrix) for all trained Machine Learning algorithms.
