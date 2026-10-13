# ML and hybrid risk-evaluation pipeline

## Data and labels
The trainer reads `data/dataset.csv` (or a replacement public corpus normalized to that path) with `subject`, `body`, and `label`. Labels are `0` for legitimate/ham and `1` for phishing/spam. The loader also accepts common aliases such as `email`, `text`, `message`, `class`, and `type`. See [`../data/README.md`](../data/README.md) for public dataset guidance.

**Important:** the small starter CSV currently in this repository is an illustrative sample, not a real-world corpus. Do not present its scores as evidence of production accuracy. Replace it with a properly licensed public corpus containing thousands of labelled emails before reporting research results.

## Leakage-safe evaluation
1. Remove empty and duplicate email text, normalize labels, and combine subject/body.
2. Split once into a stratified 80% train / 20% holdout test set (random state 42).
3. Compare Logistic Regression, Random Forest, and Linear SVM using stratified 5-fold cross-validation on training data. Each fold's TF-IDF vectorizer is fitted only on that fold's training partition because it is inside a scikit-learn `Pipeline`.
4. Select the classifier with the highest mean cross-validation F1. Report CV mean ± sample standard deviation for accuracy, precision, recall, and F1, plus separate holdout metrics and confusion matrix.
5. Save the fitted pipeline to `backend/ml/models/model.joblib`. The held-out rows are saved to `hybrid_holdout.csv` for the hybrid-system evaluation.

Run from `backend/`:
```bash
python ml/train_model.py
python ml/evaluate_hybrid.py
```

## Hybrid risk score evaluation
`evaluate_hybrid.py` runs each held-out email through the same `perform_full_email_analysis` orchestration used by the application. It evaluates the full 0–100 risk score rather than only the ML component. For binary precision/recall, score **61 or above** counts as phishing and scores below 61 count as non-phishing; this follows the application's `PHISHING` prediction boundary. The exact threshold and confusion matrix are recorded in `metrics.json`.

This binary mapping groups the application's `SUSPICIOUS` class (risk 31–60) with non-phishing for this one binary metric. Consider reporting a separate three-/four-class evaluation in future work. Metrics are only as representative as the held-out data and should not be generalized beyond it.

## Model limitations
- Linear SVM does not natively produce calibrated probabilities. The current UI's confidence field for SVM is a decision-margin-based proxy, not a calibrated probability.
- Duplicate or near-duplicate messages across data sources can inflate results; deduplicate and document dataset provenance.
- Dataset composition, class balance, and label quality affect results substantially.
- Never click or fetch links in suspicious emails during static evaluation.
