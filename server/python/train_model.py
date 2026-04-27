import pandas as pd
import pickle
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import accuracy_score

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
# URL MODEL
# =======================

url_df = pd.read_csv("data/urls_dataset.csv")

# assume columns: url, label or url, target
if 'label' in url_df.columns:
    if url_df['label'].dtype == object:
        url_df['label'] = url_df['label'].map({'benign': 0, 'malicious': 1})
elif 'target' in url_df.columns:
    url_df['label'] = url_df['target']
else:
    raise KeyError("urls_dataset.csv must contain either 'label' or 'target' column")

url_df = url_df.dropna(subset=['url', 'label'])

# Extract features using enhanced function
url_features = url_df['url'].apply(lambda x: extract_url_features(x))
X_url = pd.concat([df.reset_index(drop=True) for df in url_features], ignore_index=True)
y_url = url_df['label'].reset_index(drop=True)

X_train, X_test, y_train, y_test = train_test_split(X_url, y_url, test_size=0.2)

url_model = RandomForestClassifier(max_depth=5)
url_model.fit(X_train, y_train)

y_pred = url_model.predict(X_test)
print("URL Model Accuracy:", accuracy_score(y_test, y_pred))

pickle.dump(url_model, open("url_model.pkl", "wb"))

# =======================
# EMAIL MODEL
# =======================

email_df = pd.read_csv("data/email_dataset.csv")

# assume columns: text or body, and label
if 'label' in email_df.columns:
    if email_df['label'].dtype == object:
        email_df['label'] = email_df['label'].map({'ham': 0, 'spam': 1})
else:
    raise KeyError("email_dataset.csv must contain a 'label' column")

if 'text' in email_df.columns:
    text_col = 'text'
elif 'body' in email_df.columns:
    text_col = 'body'
else:
    raise KeyError("email_dataset.csv must contain either 'text' or 'body' column")

email_df = email_df.dropna(subset=[text_col, 'label'])
vectorizer = TfidfVectorizer()
X_text = vectorizer.fit_transform(email_df[text_col])
y_text = email_df['label']

X_train, X_test, y_train, y_test = train_test_split(X_text, y_text, test_size=0.2)

email_model = RandomForestClassifier()
email_model.fit(X_train, y_train)

y_pred = email_model.predict(X_test)
print("Email Model Accuracy:", accuracy_score(y_test, y_pred))

pickle.dump(email_model, open("email_model.pkl", "wb"))
pickle.dump(vectorizer, open("vectorizer.pkl", "wb"))

# =======================
# NETWORK MODEL (CICIDS)
# =======================

network_df = pd.read_csv("data/network_dataset.csv")

# Clean column names (CICIDS me spaces hote hain)
network_df.columns = network_df.columns.str.strip()

# Label convert
network_df['Label'] = network_df['Label'].apply(
    lambda x: 0 if x == 'BENIGN' else 1
)

# Drop non-numeric columns (IMPORTANT)
network_df = network_df.select_dtypes(include=['number'])

# Separate features & label
X_net = network_df.drop('Label', axis=1)
y_net = network_df['Label']

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X_net, y_net, test_size=0.2)

# Train model
network_model = RandomForestClassifier(n_estimators=50, max_depth=10)
network_model.fit(X_train, y_train)

# Accuracy
y_pred = network_model.predict(X_test)
print("Network Model Accuracy:", accuracy_score(y_test, y_pred))

# Save model
pickle.dump(network_model, open("network_model.pkl", "wb"))