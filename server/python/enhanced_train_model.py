"""
enhanced_train_model.py
======================================================================
Enhanced ML training for real phishing detection
Replaces mock rule-based logic with trained ML models
======================================================================
"""

import pandas as pd
import pickle
import re
import numpy as np
from urllib.parse import urlparse
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import nltk
from nltk.corpus import stopwords
import warnings
warnings.filterwarnings('ignore')

# Download NLTK data
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

# =======================
# ENHANCED URL FEATURES
# =======================

def extract_enhanced_url_features(url):
    """Extract comprehensive URL features for ML model"""
    try:
        parsed = urlparse(url)
        domain = parsed.netloc
        path = parsed.path
        
        features = {
            # Basic features
            'url_length': len(url),
            'domain_length': len(domain),
            'path_length': len(path),
            'has_https': 1 if parsed.scheme == 'https' else 0,
            'has_www': 1 if domain.startswith('www.') else 0,
            
            # Domain features
            'subdomain_count': domain.count('.') - 1 if domain.count('.') > 1 else 0,
            'has_ip_address': 1 if re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', domain) else 0,
            'has_hyphen': 1 if '-' in domain else 0,
            'has_at_symbol': 1 if '@' in url else 0,
            'has_underscore': 1 if '_' in domain else 0,
            'digit_count': sum(c.isdigit() for c in domain),
            'special_char_count': sum(not c.isalnum() for c in domain),
            
            # Path features
            'has_port': 1 if ':' in domain and not domain.endswith(':80') and not domain.endswith(':443') else 0,
            'path_depth': path.count('/'),
            'has_url_encoding': 1 if '%' in url else 0,
            'has_script': 1 if '.js' in path.lower() else 0,
            'has_executable': 1 if any(ext in path.lower() for ext in ['.exe', '.bat', '.cmd', '.scr']) else 0,
            
            # Suspicious TLDs
            'suspicious_tld': 1 if any(tld in domain.lower() for tld in 
                ['.tk', '.ml', '.ga', '.cf', '.pw', '.top', '.click', '.download', '.win']) else 0,
            
            # Keyword features
            'has_suspicious_words': 1 if any(word in url.lower() for word in 
                ['login', 'signin', 'account', 'verify', 'secure', 'update', 'bank', 'paypal', 'amazon']) else 0,
        }
        
    except Exception:
        # Fallback for malformed URLs
        features = {
            'url_length': len(url),
            'domain_length': 0,
            'path_length': 0,
            'has_https': 0,
            'has_www': 0,
            'subdomain_count': 0,
            'has_ip_address': 0,
            'has_hyphen': 0,
            'has_at_symbol': 0,
            'has_underscore': 0,
            'digit_count': 0,
            'special_char_count': 0,
            'has_port': 0,
            'path_depth': 0,
            'has_url_encoding': 0,
            'has_script': 0,
            'has_executable': 0,
            'suspicious_tld': 0,
            'has_suspicious_words': 0,
        }
    
    return pd.DataFrame([features])

# =======================
# ENHANCED MESSAGE FEATURES
# =======================

def extract_message_features(text):
    """Extract comprehensive message features for phishing detection"""
    if pd.isna(text):
        text = ""
    
    # Basic text features
    features = {
        'text_length': len(text),
        'word_count': len(text.split()),
        'sentence_count': text.count('.') + text.count('!') + text.count('?'),
        'exclamation_count': text.count('!'),
        'question_count': text.count('?'),
        'uppercase_count': sum(1 for c in text if c.isupper()),
        'uppercase_ratio': sum(1 for c in text if c.isupper()) / len(text) if len(text) > 0 else 0,
        'digit_count': sum(c.isdigit() for c in text),
        'special_char_count': sum(not c.isalnum() and not c.isspace() for c in text),
        
        # Link features
        'http_count': text.lower().count('http'),
        'https_count': text.lower().count('https'),
        'www_count': text.lower().count('www'),
        'link_count': len(re.findall(r'http[s]?://\S+', text)),
        
        # Suspicious keywords
        'urgent_words': sum(1 for word in ['urgent', 'immediate', 'action required', 'verify', 'confirm'] 
                           if word in text.lower()),
        'financial_words': sum(1 for word in ['bank', 'account', 'payment', 'credit card', 'paypal', 'invoice'] 
                              if word in text.lower()),
        'threat_words': sum(1 for word in ['suspend', 'terminate', 'legal action', 'fraud', 'security'] 
                           if word in text.lower()),
        
        # Email-specific features
        'has_email_format': 1 if re.search(r'\S+@\S+\.\S+', text) else 0,
        'phone_count': len(re.findall(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', text)),
    }
    
    return pd.DataFrame([features])

# =======================
# TRAIN URL MODEL
# =======================

def train_url_model():
    """Train enhanced URL phishing detection model"""
    print("🔗 Training URL Model...")
    
    # Load data
    url_df = pd.read_csv("data/urls_dataset_balanced.csv")
    
    # Handle different column names
    if 'label' in url_df.columns:
        if url_df['label'].dtype == object:
            url_df['label'] = url_df['label'].map({'benign': 0, 'malicious': 1, 'good': 0, 'bad': 1})
    elif 'target' in url_df.columns:
        url_df['label'] = url_df['target']
    else:
        raise KeyError("Dataset must contain 'label' or 'target' column")
    
    url_df = url_df.dropna(subset=['url', 'label'])
    
    print(f"📊 Dataset size: {len(url_df)} URLs")
    print(f"📈 Phishing URLs: {url_df['label'].sum()} ({url_df['label'].mean():.2%})")
    
    # Extract features
    print("⚙️ Extracting enhanced URL features...")
    url_features = url_df['url'].apply(lambda x: extract_enhanced_url_features(x))
    X_url = pd.concat([df.reset_index(drop=True) for df in url_features], ignore_index=True)
    y_url = url_df['label'].reset_index(drop=True)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X_url, y_url, test_size=0.2, random_state=42, stratify=y_url)
    
    # Train model with better parameters
    url_model = GradientBoostingClassifier(
        n_estimators=200,
        learning_rate=0.1,
        max_depth=6,
        random_state=42
    )
    
    url_model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = url_model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"✅ URL Model Accuracy: {accuracy:.4f}")
    print("📋 Classification Report:")
    print(classification_report(y_test, y_pred, target_names=['Benign', 'Phishing']))
    
    # Feature importance
    feature_importance = pd.DataFrame({
        'feature': X_url.columns,
        'importance': url_model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print("\n🎯 Top 10 Important Features:")
    print(feature_importance.head(10).to_string(index=False))
    
    # Save model
    with open('url_model.pkl', 'wb') as f:
        pickle.dump(url_model, f)
    
    return url_model

# =======================
# TRAIN MESSAGE MODEL
# =======================

def train_message_model():
    """Train enhanced message phishing detection model"""
    print("\n📧 Training Message Model...")
    
    # Load data
    msg_df = pd.read_csv("data/email_dataset.csv")
    
    # Handle different column names
    label_col = None
    for col in ['label', 'target', 'phishing']:
        if col in msg_df.columns:
            label_col = col
            break
    
    if label_col is None:
        raise KeyError("Dataset must contain 'label', 'target', or 'phishing' column")
    
    # Combine text columns if available
    text_columns = ['body', 'subject', 'text', 'message']
    available_text_cols = [col for col in text_columns if col in msg_df.columns]
    
    if not available_text_cols:
        raise KeyError("Dataset must contain a text column (body, subject, text, or message)")
    
    # Combine available text columns
    msg_df['combined_text'] = msg_df[available_text_cols].fillna('').astype(str).apply(' '.join, axis=1)
    
    # Clean labels
    if msg_df[label_col].dtype == object:
        label_mapping = {'benign': 0, 'ham': 0, 'good': 0, 'safe': 0,
                        'phishing': 1, 'spam': 1, 'malicious': 1, 'bad': 1}
        msg_df['label'] = msg_df[label_col].map(label_mapping).fillna(msg_df[label_col])
    else:
        msg_df['label'] = msg_df[label_col]
    
    msg_df = msg_df.dropna(subset=['combined_text', 'label'])
    
    print(f"📊 Dataset size: {len(msg_df)} messages")
    print(f"📈 Phishing messages: {msg_df['label'].sum()} ({msg_df['label'].mean():.2%})")
    
    # Extract features
    print("⚙️ Extracting enhanced message features...")
    msg_features = msg_df['combined_text'].apply(lambda x: extract_message_features(x))
    X_msg = pd.concat([df.reset_index(drop=True) for df in msg_features], ignore_index=True)
    y_msg = msg_df['label'].reset_index(drop=True)
    
    # Add TF-IDF features
    print("📝 Creating TF-IDF features...")
    vectorizer = TfidfVectorizer(
        max_features=1000,
        stop_words='english',
        ngram_range=(1, 2),
        min_df=2,
        max_df=0.95
    )
    
    tfidf_features = vectorizer.fit_transform(msg_df['combined_text'])
    tfidf_df = pd.DataFrame(tfidf_features.toarray(), 
                          columns=[f'tfidf_{i}' for i in range(tfidf_features.shape[1])])
    
    # Combine features
    X_combined = pd.concat([X_msg.reset_index(drop=True), tfidf_df.reset_index(drop=True)], axis=1)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X_combined, y_msg, test_size=0.2, random_state=42, stratify=y_msg
    )
    
    # Train model
    msg_model = RandomForestClassifier(
        n_estimators=200,
        max_depth=10,
        random_state=42,
        class_weight='balanced'
    )
    
    msg_model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = msg_model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"✅ Message Model Accuracy: {accuracy:.4f}")
    print("📋 Classification Report:")
    print(classification_report(y_test, y_pred, target_names=['Benign', 'Phishing']))
    
    # Save models
    with open('email_model.pkl', 'wb') as f:
        pickle.dump(msg_model, f)
    with open('vectorizer.pkl', 'wb') as f:
        pickle.dump(vectorizer, f)
    
    return msg_model, vectorizer

# =======================
# MAIN TRAINING FUNCTION
# =======================

def main():
    """Train all models"""
    print("🚀 Starting Enhanced ML Training for Phishing Detection")
    print("=" * 60)
    
    try:
        # Train URL model
        url_model = train_url_model()
        
        # Train message model
        msg_model, vectorizer = train_message_model()
        
        print("\n" + "=" * 60)
        print("✅ All models trained successfully!")
        print("📁 Models saved: url_model.pkl, email_model.pkl, vectorizer.pkl")
        print("\n🎯 Ready to replace mock logic with real ML predictions!")
        
    except Exception as e:
        print(f"❌ Training failed: {e}")
        raise

if __name__ == "__main__":
    main()
