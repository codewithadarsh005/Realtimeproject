"""
enhanced_app.py
======================================================================
Enhanced REST API for AI Phishing Detection Models
Uses real ML models instead of mock rule-based logic
======================================================================
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import os
import pandas as pd
import re
import traceback
from urllib.parse import urlparse

app = Flask(__name__)
CORS(app)

# ========================================================================
# MODEL LOADING
# ========================================================================

BASE_DIR = os.path.dirname(__file__)

# Load models
try:
    url_model = pickle.load(open(os.path.join(BASE_DIR, 'url_model.pkl'), 'rb'))
    print("✓ URL model loaded")
except Exception as e:
    print(f"✗ URL model failed: {e}")
    url_model = None

try:
    email_model = pickle.load(open(os.path.join(BASE_DIR, 'email_model.pkl'), 'rb'))
    print("✓ Email model loaded")
except Exception as e:
    print(f"✗ Email model failed: {e}")
    email_model = None

try:
    vectorizer = pickle.load(open(os.path.join(BASE_DIR, 'vectorizer.pkl'), 'rb'))
    print("✓ Vectorizer loaded")
except Exception as e:
    print(f"✗ Vectorizer failed: {e}")
    vectorizer = None

# ========================================================================
# FEATURE EXTRACTION (matches training)
# ========================================================================

def extract_enhanced_url_features(url):
    """Extract comprehensive URL features - matches training pipeline"""
    try:
        parsed = urlparse(url)
        domain = parsed.netloc
        path = parsed.path
        
        features = {
            'url_length': len(url),
            'domain_length': len(domain),
            'path_length': len(path),
            'has_https': 1 if parsed.scheme == 'https' else 0,
            'has_www': 1 if domain.startswith('www.') else 0,
            'subdomain_count': domain.count('.') - 1 if domain.count('.') > 1 else 0,
            'has_ip_address': 1 if re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', domain) else 0,
            'has_hyphen': 1 if '-' in domain else 0,
            'has_at_symbol': 1 if '@' in url else 0,
            'has_underscore': 1 if '_' in domain else 0,
            'digit_count': sum(c.isdigit() for c in domain),
            'special_char_count': sum(not c.isalnum() for c in domain),
            'has_port': 1 if ':' in domain and not domain.endswith(':80') and not domain.endswith(':443') else 0,
            'path_depth': path.count('/'),
            'has_url_encoding': 1 if '%' in url else 0,
            'has_script': 1 if '.js' in path.lower() else 0,
            'has_executable': 1 if any(ext in path.lower() for ext in ['.exe', '.bat', '.cmd', '.scr']) else 0,
            'suspicious_tld': 1 if any(tld in domain.lower() for tld in 
                ['.tk', '.ml', '.ga', '.cf', '.pw', '.top', '.click', '.download', '.win']) else 0,
            'has_suspicious_words': 1 if any(word in url.lower() for word in 
                ['login', 'signin', 'account', 'verify', 'secure', 'update', 'bank', 'paypal', 'amazon']) else 0,
        }
        
    except Exception:
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

def extract_message_features(text):
    """Extract comprehensive message features - matches training pipeline"""
    if pd.isna(text):
        text = ""
    
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
        'http_count': text.lower().count('http'),
        'https_count': text.lower().count('https'),
        'www_count': text.lower().count('www'),
        'link_count': len(re.findall(r'http[s]?://\S+', text)),
        'urgent_words': sum(1 for word in ['urgent', 'immediate', 'action required', 'verify', 'confirm'] 
                           if word in text.lower()),
        'financial_words': sum(1 for word in ['bank', 'account', 'payment', 'credit card', 'paypal', 'invoice'] 
                              if word in text.lower()),
        'threat_words': sum(1 for word in ['suspend', 'terminate', 'legal action', 'fraud', 'security'] 
                           if word in text.lower()),
        'has_email_format': 1 if re.search(r'\S+@\S+\.\S+', text) else 0,
        'phone_count': len(re.findall(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', text)),
    }
    
    return pd.DataFrame([features])

def generate_reasons(features, prediction, prediction_type):
    """Generate human-readable reasons for the prediction"""
    reasons = []
    
    if prediction_type == 'url':
        if features['has_ip_address'].iloc[0]:
            reasons.append("Uses IP address instead of domain name")
        if not features['has_https'].iloc[0]:
            reasons.append("Not using HTTPS encryption")
        if features['has_hyphen'].iloc[0]:
            reasons.append("Contains hyphens in domain")
        if features['suspicious_tld'].iloc[0]:
            reasons.append("Uses suspicious top-level domain")
        if features['has_suspicious_words'].iloc[0]:
            reasons.append("Contains suspicious keywords")
        if features['subdomain_count'].iloc[0] > 2:
            reasons.append("Excessive subdomains")
        if features['has_url_encoding'].iloc[0]:
            reasons.append("Contains URL encoding (possible obfuscation)")
        if features['url_length'].iloc[0] > 100:
            reasons.append("Unusually long URL")
    
    elif prediction_type == 'message':
        if features['urgent_words'].iloc[0] > 0:
            reasons.append("Contains urgency-inducing words")
        if features['financial_words'].iloc[0] > 0:
            reasons.append("Mentions financial topics")
        if features['threat_words'].iloc[0] > 0:
            reasons.append("Contains threatening language")
        if features['link_count'].iloc[0] > 2:
            reasons.append("Multiple links detected")
        if features['uppercase_ratio'].iloc[0] > 0.3:
            reasons.append("Excessive capitalization")
        if features['exclamation_count'].iloc[0] > 2:
            reasons.append("Multiple exclamation marks")
        if features['has_email_format'].iloc[0]:
            reasons.append("Contains email addresses (possible spoofing)")
    
    if prediction == 1:  # Phishing
        if not reasons:
            reasons.append("ML model detected phishing patterns")
    else:  # Benign
        if not reasons:
            reasons.append("No suspicious patterns detected")
    
    return reasons

# ========================================================================
# API ENDPOINTS
# ========================================================================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'models': {
            'url': url_model is not None,
            'email': email_model is not None,
            'vectorizer': vectorizer is not None
        }
    })

@app.route('/predict/url', methods=['POST'])
def predict_url():
    """Predict if URL is phishing"""
    try:
        data = request.get_json()
        
        if not data or 'url' not in data:
            return jsonify({'error': 'URL is required'}), 400
        
        url = data['url']
        
        if url_model is None:
            return jsonify({'error': 'URL model not loaded'}), 500
        
        # Extract features
        features = extract_enhanced_url_features(url)
        
        # Make prediction
        prediction = url_model.predict(features)[0]
        probability = url_model.predict_proba(features)[0]
        
        # Calculate risk score (0-100)
        risk_score = int(probability[1] * 100)
        
        # Generate reasons
        reasons = generate_reasons(features, prediction, 'url')
        
        return jsonify({
            'riskScore': risk_score,
            'risk_score': risk_score,
            'prediction': int(prediction),
            'is_phishing': bool(prediction),
            'confidence': float(max(probability)),
            'reasons': reasons,
            'features': features.to_dict('records')[0]
        })
        
    except Exception as e:
        print(f"URL prediction error: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/predict/message', methods=['POST'])
def predict_message():
    """Predict if message is phishing"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'error': 'Text is required'}), 400
        
        text = data['text']
        
        if email_model is None or vectorizer is None:
            return jsonify({'error': 'Message model or vectorizer not loaded'}), 500
        
        # Extract features
        features = extract_message_features(text)
        
        # Add TF-IDF features
        tfidf_features = vectorizer.transform([text])
        tfidf_df = pd.DataFrame(tfidf_features.toarray(), 
                              columns=[f'tfidf_{i}' for i in range(tfidf_features.shape[1])])
        
        # Combine features
        combined_features = pd.concat([features.reset_index(drop=True), tfidf_df.reset_index(drop=True)], axis=1)
        
        # Make prediction
        prediction = email_model.predict(combined_features)[0]
        probability = email_model.predict_proba(combined_features)[0]
        
        # Calculate risk score (0-100)
        risk_score = int(probability[1] * 100)
        
        # Generate reasons
        reasons = generate_reasons(features, prediction, 'message')
        
        return jsonify({
            'riskScore': risk_score,
            'risk_score': risk_score,
            'prediction': int(prediction),
            'is_phishing': bool(prediction),
            'confidence': float(max(probability)),
            'reasons': reasons,
            'features': features.to_dict('records')[0]
        })
        
    except Exception as e:
        print(f"Message prediction error: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/features/url', methods=['POST'])
def get_url_features():
    """Extract URL features without prediction"""
    try:
        data = request.get_json()
        url = data.get('url', '')
        features = extract_enhanced_url_features(url)
        return jsonify(features.to_dict('records')[0])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/features/message', methods=['POST'])
def get_message_features():
    """Extract message features without prediction"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        features = extract_message_features(text)
        return jsonify(features.to_dict('records')[0])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ========================================================================
# MAIN
# ========================================================================

if __name__ == '__main__':
    print("🚀 Starting Enhanced Phishing Detection API")
    print("=" * 50)
    print("📊 Available endpoints:")
    print("  GET  /health")
    print("  POST /predict/url")
    print("  POST /predict/message")
    print("  POST /features/url")
    print("  POST /features/message")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=8000, debug=True)
