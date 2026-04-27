"""
app.py
======================================================================
REST API for AI Phishing Detection Models
Serves predictions for URL, Email, and Network threats

Run: python app.py
Access: http://localhost:8000
======================================================================
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import os
import pandas as pd
import traceback

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# ========================================================================
# MODEL LOADING
# ========================================================================

BASE_DIR = os.path.dirname(__file__)

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

try:
    network_model = pickle.load(open(os.path.join(BASE_DIR, 'network_model.pkl'), 'rb'))
    print("✓ Network model loaded")
except Exception as e:
    print(f"✗ Network model failed: {e}")
    network_model = None

# ========================================================================
# FEATURE EXTRACTION
# ========================================================================

def extract_url_features(url):
    """Extract URL features for prediction"""
    return pd.DataFrame({
        'length': [len(url)],
        'has_https': [1 if 'https' in url else 0],
        'has_at': [1 if '@' in url else 0],
        'has_dash': [1 if '-' in url else 0],
        'dots': [url.count('.')]
    })

# ========================================================================
# HEALTH CHECK
# ========================================================================

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'status': 'ok',
        'models': {
            'url': url_model is not None,
            'email': email_model is not None,
            'network': network_model is not None
        }
    }), 200

# ========================================================================
# PREDICTION ENDPOINTS
# ========================================================================

@app.route('/api/predict/url', methods=['POST'])
def predict_url():
    """
    Predict URL threat
    Body: { "length": 100, "has_https": 1, "has_at": 0, "has_dash": 0, "dots": 3 }
    """
    try:
        if not url_model:
            return jsonify({'success': False, 'error': 'URL model not loaded'}), 500

        data = request.get_json()
        
        # If raw URL provided, extract features
        if 'url' in data:
            features = extract_url_features(data['url'])
        else:
            # Assume features already provided
            features = pd.DataFrame([{
                'length': data.get('length', 0),
                'has_https': data.get('has_https', 0),
                'has_at': data.get('has_at', 0),
                'has_dash': data.get('has_dash', 0),
                'dots': data.get('dots', 0)
            }])

        # Make prediction
        prediction = url_model.predict(features)[0]
        risk_score = 100 if prediction == 1 else 0

        return jsonify({
            'success': True,
            'riskScore': int(risk_score),
            'reasons': ['Phishing detected'] if prediction == 1 else ['URL appears safe']
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 400

@app.route('/api/predict/email', methods=['POST'])
def predict_email():
    """
    Predict Email/Message threat
    Body: { "message": "Click here to verify account" }
    """
    try:
        if not email_model or not vectorizer:
            return jsonify({'success': False, 'error': 'Email model not loaded'}), 500

        data = request.get_json()
        message = data.get('message', '')

        # Vectorize and predict
        vec = vectorizer.transform([message])
        prediction = email_model.predict(vec)[0]
        risk_score = 100 if prediction == 1 else 0

        return jsonify({
            'success': True,
            'riskScore': int(risk_score),
            'reasons': ['Phishing detected'] if prediction == 1 else ['Email appears safe']
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 400

@app.route('/api/predict/network', methods=['POST'])
def predict_network():
    """
    Predict Network threat
    Body: { "features": [0, 1, 0.5, ...] } or comma-separated string
    """
    try:
        if not network_model:
            return jsonify({'success': False, 'error': 'Network model not loaded'}), 500

        data = request.get_json()
        
        # Parse features
        if isinstance(data.get('features'), str):
            features = list(map(float, data['features'].split(',')))
        else:
            features = data.get('features', [])

        # Create DataFrame
        df = pd.DataFrame([features])

        # Predict
        prediction = network_model.predict(df)[0]
        risk_score = 100 if prediction == 1 else 0

        return jsonify({
            'success': True,
            'riskScore': int(risk_score),
            'reasons': ['Attack detected'] if prediction == 1 else ['Network appears safe']
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 400

# ========================================================================
# ERROR HANDLERS
# ========================================================================

@app.route('/', methods=['GET'])
def index():
    """Welcome endpoint"""
    return jsonify({
        'success': True,
        'message': 'AI Phishing Detection API',
        'endpoints': {
            'health': 'GET /api/health',
            'predict_url': 'POST /api/predict/url',
            'predict_email': 'POST /api/predict/email',
            'predict_network': 'POST /api/predict/network'
        }
    }), 200

@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'success': False, 'error': 'Internal server error'}), 500

# ========================================================================
# RUN
# ========================================================================

if __name__ == '__main__':
    print("\n" + "="*70)
    print("AI Phishing Detection REST API")
    print("="*70)
    print(f"Running on http://localhost:8000")
    print("CORS enabled for all origins")
    print("="*70 + "\n")
    
    app.run(host='0.0.0.0', port=8000, debug=True)
