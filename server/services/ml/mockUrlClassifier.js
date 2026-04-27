'use strict';

/**
 * mockUrlClassifier.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Consumes a URL feature vector (from urlFeatureExtractor) and returns a
 * { riskScore, reasons } prediction.
 *
 * SWAP POINT — to use a real model, replace this file's logic with:
 *   • A call to a Python Flask/FastAPI ML endpoint
 *   • A TensorFlow.js in-process model
 *   • An external AI API (OpenAI, AWS Comprehend, etc.)
 *
 * The function signature must stay the same:
 *   classifyUrl(features) → Promise<{ riskScore: number, reasons: string[] }>
 * ─────────────────────────────────────────────────────────────────────────────
 */

// Keywords and TLDs are extracted by urlFeatureExtractor — no direct use here
async function classifyUrl(features) {
  const reasons = [];
  let score = 0;

  if (features.parseError) {
    return { riskScore: 60, reasons: ['Could not parse URL — malformed structure'] };
  }

  if (!features.isHttps) {
    score += 25;
    reasons.push('No HTTPS — connection is unencrypted');
  }

  if (features.isIpAddress) {
    score += 30;
    reasons.push('IP address used instead of a domain name');
  }

  if (features.suspiciousTld) {
    score += 20;
    reasons.push(`Suspicious top-level domain: ${features.suspiciousTld}`);
  }

  if (features.subdomainCount > 2) {
    score += 15;
    reasons.push('Excessive subdomains — common phishing pattern');
  }

  if (features.hasHyphenInDomain) {
    score += 10;
    reasons.push('Hyphenated domain name — frequently used in phishing');
  }

  if (features.matchedKeywords.length > 0) {
    score += Math.min(features.matchedKeywords.length * 8, 25);
    reasons.push(`Sensitive keywords in URL: ${features.matchedKeywords.slice(0, 3).join(', ')}`);
  }

  if (features.urlLength > 100) {
    score += 10;
    reasons.push('Unusually long URL — may be obfuscating destination');
  }

  if (features.hasUrlEncoding) {
    score += 10;
    reasons.push('URL-encoded characters detected — possible obfuscation');
  }

  if (features.hasPort) {
    score += 8;
    reasons.push('Non-standard port in URL — uncommon for legitimate sites');
  }

  score = Math.min(score, 100);

  if (score === 0) {
    reasons.push(
      'HTTPS encryption present',
      'No suspicious keywords found',
      'Domain structure looks legitimate'
    );
  }

  return { riskScore: score, reasons };
}

module.exports = { classifyUrl };
