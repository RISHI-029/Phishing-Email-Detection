import re
import string
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

# Ensure required NLTK resources are available
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords', quiet=True)

try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('wordnet', quiet=True)

# Fallback basic stop words if NLTK is not accessible
DEFAULT_STOP_WORDS = {
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're", "you've", "you'll", "you'd",
    'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', "she's", 'her', 'hers',
    'herself', 'it', "it's", 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which',
    'who', 'whom', 'this', 'that', "that'll", 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if',
    'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between',
    'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out',
    'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why',
    'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
    'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', "don't", 'should'
}

try:
    STOP_WORDS = set(stopwords.words('english'))
except Exception:
    STOP_WORDS = DEFAULT_STOP_WORDS

lemmatizer = WordNetLemmatizer()

def clean_text(text: str) -> str:
    """
    Cleans raw email text by converting to lowercase, removing HTML tags,
    special characters, URL patterns, punctuation, and extra whitespace.
    """
    if not text or not isinstance(text, str):
        return ""
    
    # 1. Lowercase
    text = text.lower()
    
    # 2. Strip HTML tags
    text = re.sub(r'<[^>]+>', ' ', text)
    
    # 3. Replace URLs with token
    text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', ' urltoken ', text)
    
    # 4. Replace email addresses with token
    text = re.sub(r'[\w\.-]+@[\w\.-]+\.\w+', ' emailtoken ', text)
    
    # 5. Remove numbers and punctuation
    text = re.sub(r'[^a-zA-Z\s]', ' ', text)
    
    # 6. Normalize whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

def preprocess_email_text(subject: str, body: str) -> str:
    """
    Combines subject and body, cleans, tokenizes, removes stop words, and lemmatizes words.
    Returns cleaned token string ready for TF-IDF vectorization.
    """
    combined = f"{subject or ''} {body or ''}"
    cleaned = clean_text(combined)
    
    tokens = cleaned.split()
    processed_tokens = []
    
    for token in tokens:
        if token not in STOP_WORDS and len(token) > 1:
            try:
                lemma = lemmatizer.lemmatize(token)
            except Exception:
                lemma = token
            processed_tokens.append(lemma)
            
    return " ".join(processed_tokens)
