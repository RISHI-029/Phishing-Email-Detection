"""Evaluate the application's complete risk score on the labelled holdout set.

Run after training, from backend/: python ml/evaluate_hybrid.py
This intentionally evaluates the production orchestration service rather than the
text classifier alone. Positive class means phishing; score >= 61 is flagged phishing.
"""
import json
import os
import sys
import pandas as pd
from sklearn.metrics import precision_score, recall_score, f1_score, confusion_matrix, accuracy_score

BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PROJECT_DIR = os.path.abspath(os.path.join(BACKEND_DIR, ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.services.email_analysis_service import perform_full_email_analysis

def evaluate():
    holdout_path = os.path.join(os.path.dirname(__file__), "models", "hybrid_holdout.csv")
    metrics_path = os.path.join(os.path.dirname(__file__), "models", "metrics.json")
    if not os.path.exists(holdout_path):
        raise FileNotFoundError("Holdout file missing. Run: python ml/train_model.py")
    df = pd.read_csv(holdout_path).fillna("")
    actual, predicted, scores = [], [], []
    for row in df.itertuples(index=False):
        result = perform_full_email_analysis(sender="analyst@example.org", subject=str(row.subject), body=str(row.body))
        score = int(result["risk_score"])
        scores.append(score)
        actual.append(int(row.label))
        predicted.append(1 if score >= 61 else 0)
    summary = {
        "definition": "Hybrid risk score >= 61 is counted as phishing; 0-60 is counted as non-phishing for binary metrics.",
        "threshold": 61,
        "samples": len(df),
        "accuracy": round(float(accuracy_score(actual, predicted)), 4),
        "precision": round(float(precision_score(actual, predicted, zero_division=0)), 4),
        "recall": round(float(recall_score(actual, predicted, zero_division=0)), 4),
        "f1_score": round(float(f1_score(actual, predicted, zero_division=0)), 4),
        "confusion_matrix": confusion_matrix(actual, predicted, labels=[0, 1]).tolist(),
        "risk_score_mean": round(sum(scores) / len(scores), 2) if scores else 0,
        "note": "Metrics apply only to this held-out dataset and are not a guarantee of real-world performance."
    }
    with open(metrics_path, encoding="utf-8") as f:
        payload = json.load(f)
    payload["hybrid_system_holdout"] = summary
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)
    print(json.dumps(summary, indent=2))
    return summary

if __name__ == "__main__":
    evaluate()
