# Dataset setup

## Current repository data
`dataset.csv` is a small illustrative starter dataset. It is **not** a real-world corpus and is too small to support defensible accuracy claims. The training code warns when fewer than 1,000 rows are available.

## Recommended public datasets
Use a public dataset only after checking its license, provenance, label definitions, and permitted research/republication terms. Examples to investigate:
- **SpamAssassin Public Corpus** (legitimate and spam email): https://spamassassin.apache.org/old/publiccorpus/
- **Enron email corpus** (legitimate email; you must obtain/curate appropriate phishing examples separately): https://www.cs.cmu.edu/~enron/
- **Nazario phishing corpus** (phishing examples; check availability and reuse terms).
- A Kaggle phishing-email CSV dataset, subject to its specific license and source attribution.

Do not simply combine unrelated datasets and assume their labels/format are compatible. Record the dataset name, version/date downloaded, source URL, license, number of rows per class, and any cleaning steps in your report.

## Prepare the CSV
Place a licensed, labelled CSV at `data/dataset.csv` with:
```csv
subject,body,label
"Team meeting","Agenda for tomorrow",0
"Urgent account verification","Enter credentials at the link",1
```
`label=0` means legitimate/ham; `label=1` means phishing/spam. The trainer also recognizes common body columns such as `email`, `text`, `message`, `email_text`, or `content`, and common label columns such as `class` or `type`. If the source has different labels, explicitly map them before training. If it has only one text column, the trainer treats it as the email body and uses an empty subject.

After replacing the sample dataset, from `backend/` run:
```bash
python ml/train_model.py
python ml/evaluate_hybrid.py
```
The second command evaluates the actual app risk score on the untouched 20% holdout set. Do not quote metrics from the starter dataset as real-world performance.
