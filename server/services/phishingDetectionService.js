'use strict';

/**
 * phishingDetectionService.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Public API for phishing detection.
 * Controllers call ONLY this file.
 *
 * URL scan pipeline (parallel):
 *   ┌─ ML analysis  (feature extraction → model adapter)
 *   │
 *   ├─ Threat Intel (local DB + external providers)
 *   │
 *   └─ Merge → highest risk score wins, reasons combined
 * ──────────────────────────────────────────────────────────────────────────────
 */

const { extractUrlFeatures }        = require('./ml/urlFeatureExtractor');
const { extractMessageFeatures }    = require('./ml/messageFeatureExtractor');
const { predictUrl, predictMessage } = require('./ml/modelAdapter');
const threatIntel                   = require('./threatIntelligence');

// ── Thresholds ────────────────────────────────────────────────────────────────
const THRESHOLDS = {
  phishing:   60,
  suspicious: 25,
};

/**
 * @param {number} riskScore
 * @returns {'safe'|'suspicious'|'phishing'}
 */
function resolveResult(riskScore) {
  if (riskScore >= THRESHOLDS.phishing)   return 'phishing';
  if (riskScore >= THRESHOLDS.suspicious) return 'suspicious';
  return 'safe';
}

/**
 * Analyse a URL — runs ML analysis and threat intelligence in parallel.
 *
 * @param {string} url
 * @returns {Promise<{
 *   result:       'safe'|'suspicious'|'phishing',
 *   riskScore:    number,
 *   reasons:      string[],
 *   threatIntel:  {
 *     isThreat:   boolean,
 *     confidence: number,
 *     matches:    object[],
 *   },
 *   features:     object,
 * }>}
 */
async function analyseUrl(url) {
  const features = extractUrlFeatures(url);

  // Run ML prediction and threat intel lookup in parallel
  const [mlResult, intelResult] = await Promise.all([
    predictUrl(features),
    threatIntel.checkUrl(url),
  ]);

  // Merge: if threat intel found a match, boost the risk score
  // Threat intel confidence maps directly to risk score contribution
  const intelScore = intelResult.isThreat
    ? Math.round(intelResult.confidence * 0.9)   // scale: 95 confidence → 85 score boost
    : 0;

  const riskScore = Math.min(100, Math.max(mlResult.riskScore, intelScore));

  // Combine reasons — threat intel reasons prepended (higher signal)
  const reasons = [
    ...intelResult.threatReasons,
    ...mlResult.reasons,
  ];

  const result = resolveResult(riskScore);

  return {
    result,
    riskScore,
    reasons,
    threatIntel: {
      isThreat:   intelResult.isThreat,
      confidence: intelResult.confidence,
      matches:    intelResult.matches,
    },
    features,
  };
}

/**
 * Analyse an email or SMS message.
 * (Threat intel is URL-focused — message analysis uses ML only)
 *
 * @param {string} text
 * @param {'email'|'sms'} messageType
 * @returns {Promise<{
 *   result:    'safe'|'suspicious'|'phishing',
 *   riskScore: number,
 *   reasons:   string[],
 *   features:  object,
 * }>}
 */
async function analyseMessage(text, messageType = 'email') {
  const features               = extractMessageFeatures(text);
  const { riskScore, reasons } = await predictMessage(features);
  const result                 = resolveResult(riskScore);

  return { result, riskScore, reasons, features };
}

module.exports = { analyseUrl, analyseMessage, resolveResult, THRESHOLDS };
