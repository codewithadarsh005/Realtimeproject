'use strict';

/**
 * mockMessageClassifier.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Consumes a message feature vector (from messageFeatureExtractor) and returns
 * a { riskScore, reasons } prediction.
 *
 * SWAP POINT — replace this file's logic with a real NLP model:
 *   • POST features to a Python FastAPI endpoint running BERT / scikit-learn
 *   • Call AWS Comprehend / Google NLP API
 *   • Run an ONNX model in-process
 *
 * The function signature must stay the same:
 *   classifyMessage(features) → Promise<{ riskScore: number, reasons: string[] }>
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { MESSAGE_PHISHING_PATTERNS } = require('./constants');

// Build label map from shared constants — single source of truth
const PATTERN_LABELS = Object.fromEntries(
  MESSAGE_PHISHING_PATTERNS.map(({ id, label }) => [id, label])
);

/**
 * @param {object} features  Output of extractMessageFeatures()
 * @returns {Promise<{ riskScore: number, reasons: string[] }>}
 */
async function classifyMessage(features) {
  const reasons = features.matchedPatterns
    .map(({ id }) => PATTERN_LABELS[id] || id);

  let score = Math.min(features.totalMatchWeight, 90);

  if (features.hasExcessiveLinks) {
    score += 10;
    reasons.push(`Contains ${features.totalLinkCount} links — unusual for legitimate messages`);
  }

  if (features.hasAllCaps) {
    score += 5;
    reasons.push('Excessive capitalisation — common urgency tactic');
  }

  score = Math.min(score, 100);

  if (score === 0) {
    reasons.push(
      'No phishing keywords detected',
      'No suspicious links found',
      'Tone appears legitimate'
    );
  }

  return { riskScore: score, reasons };
}

module.exports = { classifyMessage };
