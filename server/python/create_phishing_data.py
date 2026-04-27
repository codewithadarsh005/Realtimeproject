"""
create_phishing_data.py
======================================================================
Create synthetic phishing URLs to balance the dataset
======================================================================
"""

import pandas as pd
import random

def create_phishing_urls():
    """Generate synthetic phishing URLs"""
    phishing_patterns = [
        "http://{domain}.tk/login",
        "http://secure-{bank}.com/verify-account",
        "http://{service}.update-security.com/signin",
        "http://192.168.1.{ip}/admin/login",
        "http://paypal-{number}.secure-update.com",
        "http://amazon.{suspicious_tld}/account-verify",
        "http://{bank}-security.com/urgent-action",
        "http://bit.ly/{random}",
        "http://tinyurl.com/{random}",
        "http://{domain}.ml/confirm?id={random}",
        "http://secure.{service}.ga/login.php",
        "http://{bank}-alert.cf/verify",
        "http://{domain}.pw/update-account",
        "http://click.{service}.top/confirm",
        "http://{bank}.download/secure",
    ]
    
    banks = ["chase", "wellsfargo", "bankofamerica", "citibank", "capitalone"]
    services = ["microsoft", "google", "apple", "facebook", "amazon"]
    suspicious_tlds = ["tk", "ml", "ga", "cf", "pw", "top", "click"]
    
    phishing_urls = []
    for _ in range(5000):  # Create 5000 phishing URLs
        template = random.choice(phishing_patterns)
        
        replacements = {
            'domain': f"{''.join(random.choices('abcdefghijklmnopqrstuvwxyz', k=8))}",
            'bank': random.choice(banks),
            'service': random.choice(services),
            'suspicious_tld': random.choice(suspicious_tlds),
            'ip': str(random.randint(1, 254)),
            'number': str(random.randint(100, 999)),
            'random': ''.join(random.choices('abcdefghijklmnopqrstuvwxyz0123456789', k=10))
        }
        
        url = template.format(**replacements)
        phishing_urls.append(url)
    
    return phishing_urls

def main():
    # Load existing benign URLs
    print("Loading existing dataset...")
    benign_df = pd.read_csv("data/urls_dataset.csv")
    
    # Create phishing URLs
    print("Creating phishing URLs...")
    phishing_urls = create_phishing_urls()
    
    # Create phishing DataFrame
    phishing_df = pd.DataFrame({
        'url': phishing_urls,
        'target': 1  # 1 for phishing
    })
    
    # Combine datasets
    print("Combining datasets...")
    # Take a subset of benign URLs to balance the dataset
    benign_subset = benign_df.sample(n=min(5000, len(benign_df)), random_state=42)
    
    combined_df = pd.concat([benign_subset, phishing_df], ignore_index=True)
    
    # Shuffle the dataset
    combined_df = combined_df.sample(frac=1, random_state=42).reset_index(drop=True)
    
    # Save the balanced dataset
    combined_df.to_csv("data/urls_dataset_balanced.csv", index=False)
    
    print(f"✅ Created balanced dataset:")
    print(f"   Total URLs: {len(combined_df)}")
    print(f"   Benign URLs: {len(combined_df[combined_df['target'] == 0])}")
    print(f"   Phishing URLs: {len(combined_df[combined_df['target'] == 1])}")
    print(f"   Dataset saved to: data/urls_dataset_balanced.csv")

if __name__ == "__main__":
    main()
