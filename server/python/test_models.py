import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
import pandas as pd

# Test URL model
url_model = pickle.load(open('url_model.pkl', 'rb'))
print('URL Model Predictions:')
test_urls = [
    (15, 'short url'),
    (100, 'long url'),
    (200, 'very long url'),
]
for length, desc in test_urls:
    df = pd.DataFrame({'length': [length]})
    pred = url_model.predict(df)
    print(f'  {desc}: {pred[0]} (0=safe, 1=phishing)')

# Test Email model
email_model = pickle.load(open('email_model.pkl', 'rb'))
vectorizer = pickle.load(open('vectorizer.pkl', 'rb'))
print('\nEmail Model Predictions:')
test_emails = [
    'verify your account now',
    'click here to confirm identity',
    'update payment information',
    'hello how are you',
]
for email in test_emails:
    vec = vectorizer.transform([email])
    pred = email_model.predict(vec)
    print(f'  "{email}": {pred[0]} (0=ham, 1=spam)')

# Test Network model
network_model = pickle.load(open('network_model.pkl', 'rb'))

print('\nNetwork Model Predictions:')

# Dummy test input (random values)
test_input = [0]*10  # adjust based on dataset columns
df = pd.DataFrame([test_input])

pred = network_model.predict(df)
print(f'  Network sample: {pred[0]} (0=safe, 1=attack)')
