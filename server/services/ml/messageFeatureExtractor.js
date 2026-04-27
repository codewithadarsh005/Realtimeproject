'use strict';

/**
 * messageFeatureExtractor.js
 * Extracts structured features from email / SMS text.
 * Same pattern as urlFeatureExtractor — features feed into the classifier.
 */

const { MESSAGE_PHISHING_PATTERNS: PHISHING_PATTERNS } = require('./constants');

/**
 * @param {string} text
 * @returns {object} Feature vector
 */
function extractMessageFeatures(text) {
  const matchedPatterns = PHISHING_PATTERNS
    .filter(({ pattern }) => pattern.test(text))
    .map(({ id, weight }) => ({ id, weight }));

  const httpLinks  = (text.match(/http:\/\//gi)  || []).length;
  const httpsLinks = (text.match(/https:\/\//gi) || []).length;
  const totalLinks = httpLinks + httpsLinks;

  return {
    raw:             text,
    charCount:       text.length,
    wordCount:       text.trim().split(/\s+/).length,
    matchedPatterns,                          // array of { id, weight }
    totalMatchWeight: matchedPatterns.reduce((s, p) => s + p.weight, 0),
    httpLinkCount:   httpLinks,
    httpsLinkCount:  httpsLinks,
    totalLinkCount:  totalLinks,
    hasExcessiveLinks: totalLinks > 2,
    hasAllCaps:      /[A-Z]{5,}/.test(text),  // shouting — urgency signal
    sentenceCount:   (text.match(/[.!?]+/g) || []).length,
  };
}

module.exports = { extractMessageFeatures, PHISHING_PATTERNS };
