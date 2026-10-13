"""Prediction helpers for the persisted TF-IDF + classifier sklearn Pipeline."""
import os
import joblib
from typing import Tuple
from preprocessing import preprocess_email_text

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(CURRENT_DIR, "models")
MODEL_PATH = os.path.join(MODELS_DIR, "model.joblib")
_model = None

def load_ml_artifacts():
    global _model
    if _model is not None:
        return _model
    if not os.path.exists(MODEL_PATH):
        print("[!] ML pipeline missing. Training from configured dataset...")
        from train_model import train_and_evaluate_models
        project_dir = os.path.abspath(os.path.join(CURRENT_DIR, "..", ".."))
        train_and_evaluate_models(os.path.join(project_dir, "data", "dataset.csv"), MODELS_DIR)
    _model = joblib.load(MODEL_PATH)
    return _model

def predict_email(subject: str, body: str) -> Tuple[str, float]:
    model = load_ml_artifacts()
    processed_text = preprocess_email_text(subject or "", body or "")
    if not processed_text.strip():
        return "SAFE", 0.50
    phishing_probability = None
    if hasattr(model, "predict_proba"):
        phishing_probability = float(model.predict_proba([processed_text])[0][1])
        prediction = "PHISHING" if phishing_probability >= 0.5 else "SAFE"
        confidence = phishing_probability if prediction == "PHISHING" else 1.0 - phishing_probability
    else:
        prediction = "PHISHING" if int(model.predict([processed_text])[0]) == 1 else "SAFE"
        # LinearSVC has no calibrated probability. This is deliberately labelled as confidence proxy,
        # not a probability, so callers should not interpret it as calibrated confidence.
        decision = float(model.decision_function([processed_text])[0])
        confidence = min(0.99, max(0.51, 0.5 + min(abs(decision), 4.0) * 0.12))
    return prediction, round(float(confidence), 4)
