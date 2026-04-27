import sys
import json
import pickle
import os
import pandas as pd

# =======================
# PATH SETUP
# =======================
# Models are saved in the python package root by train_model.py
# =======================

BASE_DIR = os.path.dirname(__file__)
MODEL_DIR = BASE_DIR

# =======================
# INPUT
# =======================

try:
    if len(sys.argv) >= 3:
        model_type = sys.argv[1]
        input_data = sys.argv[2]
    else:
        payload = json.loads(sys.stdin.read())
        model_type = payload.get('type')
        input_data = payload.get('input')
except Exception:
    print('Failed to parse input', file=sys.stderr)
    sys.exit(1)

if model_type not in ('url', 'message', 'email', 'network'):
    print('Invalid model type', file=sys.stderr)
    sys.exit(1)

if not isinstance(input_data, str) or not input_data.strip():
    print('Invalid input data', file=sys.stderr)
    sys.exit(1)

# =======================
# URL FEATURE FUNCTION
# =======================

def extract_url_features(url):
    return pd.DataFrame({
        'length': [len(url)],
        'has_https': [1 if 'https' in url else 0],
        'has_at': [1 if '@' in url else 0],
        'has_dash': [1 if '-' in url else 0],
        'dots': [url.count('.')]
    })

# =======================
# PREDICTION
# =======================

try:
    if model_type == "url":
        model = pickle.load(open(os.path.join(MODEL_DIR, "url_model.pkl"), "rb"))
        features = extract_url_features(input_data)
        pred = model.predict(features)

    elif model_type in ("message", "email"):
        model = pickle.load(open(os.path.join(MODEL_DIR, "email_model.pkl"), "rb"))
        vectorizer = pickle.load(open(os.path.join(MODEL_DIR, "vectorizer.pkl"), "rb"))

        vec = vectorizer.transform([input_data])
        pred = model.predict(vec)

    elif model_type == "network":
        model = pickle.load(open(os.path.join(MODEL_DIR, "network_model.pkl"), "rb"))

        # Dummy input (real system me live features aayenge)
        # For now assume input_data = comma-separated numbers
        values = list(map(float, input_data.split(',')))
        features = pd.DataFrame([values])

        pred = model.predict(features)

    else:
        print('Invalid model type', file=sys.stderr)
        sys.exit(1)

    risk_score = 100 if pred[0] == 1 else 0
    output = {
        'riskScore': risk_score,
        'reasons': [
            'Detected phishing' if pred[0] == 1 else 'No phishing indicators detected'
        ],
    }
    print(json.dumps(output))
    sys.exit(0)

except Exception as e:
    print(str(e), file=sys.stderr)
    sys.exit(1)