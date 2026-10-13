import joblib
from sklearn.feature_extraction.text import TfidfVectorizer

def build_vectorizer(max_features: int = 3000, ngram_range=(1, 2)) -> TfidfVectorizer:
    """
    Initializes a TfidfVectorizer with unigram and bigram capabilities.
    """
    return TfidfVectorizer(
        max_features=max_features,
        ngram_range=ngram_range,
        stop_words=None, # Already handled in preprocessing stage
        sublinear_tf=True
    )

def save_vectorizer(vectorizer: TfidfVectorizer, filepath: str):
    """
    Saves trained vectorizer to disk using Joblib.
    """
    joblib.dump(vectorizer, filepath)

def load_vectorizer(filepath: str) -> TfidfVectorizer:
    """
    Loads trained vectorizer from disk using Joblib.
    """
    return joblib.load(filepath)
