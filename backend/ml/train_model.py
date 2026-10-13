"""Leakage-safe email model training with stratified holdout and cross-validation."""
import json
import os
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_validate
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import LinearSVC
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from preprocessing import preprocess_email_text

def load_dataset(data_path):
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset not found: {data_path}")
    df = pd.read_csv(data_path)
    # Accept common public dataset column names, but normalize to subject/body/label.
    aliases = {c.lower().strip(): c for c in df.columns}
    label_col = next((aliases[c] for c in ("label", "class", "phishing", "email_type", "type") if c in aliases), None)
    subject_col = next((aliases[c] for c in ("subject", "email_subject") if c in aliases), None)
    body_col = next((aliases[c] for c in ("body", "email", "text", "message", "email_text", "content") if c in aliases), None)
    if not label_col or not (body_col or subject_col):
        raise ValueError("CSV needs a label/class column and an email text/body/message column. See data/README.md.")
    if not subject_col:
        df["subject"] = ""
        subject_col = "subject"
    if not body_col:
        df["body"] = ""
        body_col = "body"
    df = df[[subject_col, body_col, label_col]].copy()
    df.columns = ["subject", "body", "label"]
    df = df.dropna(subset=["label"])
    df["subject"] = df["subject"].fillna("").astype(str)
    df["body"] = df["body"].fillna("").astype(str)
    # Normalize common textual labels to binary: 0=legitimate, 1=phishing/spam.
    def normalize_label(v):
        if isinstance(v, (int, float)) and v in (0, 1):
            return int(v)
        s = str(v).strip().lower()
        if s in {"0", "safe", "legitimate", "ham", "benign", "legit", "not phishing"}: return 0
        if s in {"1", "phishing", "phish", "spam", "malicious"}: return 1
        raise ValueError(f"Unrecognized label {v!r}. Map labels to 0=legitimate and 1=phishing before training.")
    df["label"] = df["label"].map(normalize_label)
    df["text"] = (df["subject"] + " " + df["body"]).str.strip()
    df = df[df["text"].str.len() > 0].drop_duplicates(subset=["text", "label"]).reset_index(drop=True)
    if df["label"].nunique() != 2 or df["label"].value_counts().min() < 5:
        raise ValueError("Need both classes and at least 5 examples per class for stratified evaluation.")
    return df

def make_pipeline(classifier):
    # Vectorizer is fitted independently inside each CV fold / training split.
    return Pipeline([
        ("tfidf", TfidfVectorizer(max_features=10000, ngram_range=(1, 2), sublinear_tf=True, strip_accents="unicode")),
        ("classifier", classifier),
    ])

def train_and_evaluate_models(data_path: str, models_dir: str):
    df = load_dataset(data_path)
    X = pd.Series([preprocess_email_text(row.subject, row.body) for row in df.itertuples()], index=df.index)
    y = df["label"]
    print(f"Dataset: {len(df)} unique emails | legitimate={int((y == 0).sum())} | phishing/spam={int((y == 1).sum())}")
    if len(df) < 1000:
        print("WARNING: This is a small dataset. For defensible research metrics, use a public corpus with thousands of labelled emails (see data/README.md).")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    models = {
        "Logistic Regression": LogisticRegression(C=1.0, max_iter=2000, class_weight="balanced", random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=200, random_state=42, class_weight="balanced_subsample", n_jobs=-1),
        "Linear SVM": LinearSVC(C=1.0, class_weight="balanced", random_state=42),
    }
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    scoring = {"accuracy": "accuracy", "precision": "precision", "recall": "recall", "f1": "f1"}
    results, fitted = {}, {}
    for name, classifier in models.items():
        pipe = make_pipeline(classifier)
        scores = cross_validate(pipe, X_train, y_train, cv=cv, scoring=scoring, n_jobs=-1, error_score="raise")
        cv_summary = {metric: {"mean": round(float(scores[f"test_{metric}"].mean()), 4),
                               "std": round(float(scores[f"test_{metric}"].std(ddof=1)), 4)}
                      for metric in scoring}
        pipe.fit(X_train, y_train)
        pred = pipe.predict(X_test)
        holdout_metrics = {
            "accuracy": round(float(accuracy_score(y_test, pred)), 4),
            "precision": round(float(precision_score(y_test, pred, zero_division=0)), 4),
            "recall": round(float(recall_score(y_test, pred, zero_division=0)), 4),
            "f1_score": round(float(f1_score(y_test, pred, zero_division=0)), 4),
            "confusion_matrix": confusion_matrix(y_test, pred, labels=[0, 1]).tolist()
        }
        # Keep flat holdout keys for the existing React metrics table; add CV summary alongside.
        results[name] = {**holdout_metrics, "cross_validation": cv_summary, "holdout": holdout_metrics}
        fitted[name] = pipe
        print(f"{name}: CV F1={cv_summary['f1']['mean']:.3f} ± {cv_summary['f1']['std']:.3f}; holdout F1={results[name]['holdout']['f1_score']:.3f}")
    best_name = max(results, key=lambda n: results[n]["cross_validation"]["f1"]["mean"])
    best_pipe = fitted[best_name]
    os.makedirs(models_dir, exist_ok=True)
    joblib.dump(best_pipe, os.path.join(models_dir, "model.joblib"))
    # Keep a vectorizer artifact for compatibility/debugging; inference uses the fitted pipeline.
    joblib.dump(best_pipe.named_steps["tfidf"], os.path.join(models_dir, "vectorizer.joblib"))
    payload = {
        "best_model": best_name,
        "selection_metric": "mean 5-fold cross-validation F1",
        "selected_metrics": results[best_name]["holdout"],
        "all_models": results,
        "dataset_info": {
            "total_samples": int(len(df)), "train_samples": int(len(X_train)), "test_samples": int(len(X_test)),
            "class_distribution": {"legitimate": int((y == 0).sum()), "phishing": int((y == 1).sum())},
            "holdout_fraction": 0.2, "random_state": 42, "cv_folds": 5,
            "dataset_path": os.path.relpath(data_path, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
        }
    }
    with open(os.path.join(models_dir, "metrics.json"), "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)
    # Store deterministic holdout rows so hybrid scoring is evaluated on the exact unseen test set.
    holdout = df.loc[X_test.index, ["subject", "body", "label"]].copy()
    holdout.to_csv(os.path.join(models_dir, "hybrid_holdout.csv"), index=False)
    print(f"Selected {best_name}; saved model, metrics, and labelled holdout to {models_dir}")
    return payload

if __name__ == "__main__":
    backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    project_dir = os.path.abspath(os.path.join(backend_dir, ".."))
    train_and_evaluate_models(os.path.join(project_dir, "data", "dataset.csv"), os.path.join(os.path.dirname(__file__), "models"))
