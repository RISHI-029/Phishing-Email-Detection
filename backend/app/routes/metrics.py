import os
import json
from fastapi import APIRouter, HTTPException, status

from app.schemas.schemas import ModelMetricsResponse

router = APIRouter(prefix="/api/model", tags=["ML Model Evaluation Metrics"])

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
METRICS_PATH = os.path.abspath(os.path.join(CURRENT_DIR, "..", "..", "ml", "models", "metrics.json"))

@router.get("/metrics", response_model=ModelMetricsResponse)
def get_model_metrics():
    """
    Returns actual evaluation metrics generated during ML model training.
    """
    if not os.path.exists(METRICS_PATH):
        print("[!] metrics.json not found. Triggering automated model training...")
        from ml.train_model import train_and_evaluate_models
        base_dir = os.path.abspath(os.path.join(CURRENT_DIR, "..", "..", ".."))
        data_path = os.path.join(base_dir, "data", "dataset.csv")
        models_dir = os.path.join(CURRENT_DIR, "..", "..", "ml", "models")
        train_and_evaluate_models(data_path, models_dir)

    if not os.path.exists(METRICS_PATH):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model metrics file not found."
        )

    with open(METRICS_PATH, "r") as f:
        metrics_data = json.load(f)

    return metrics_data
