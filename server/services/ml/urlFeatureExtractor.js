'use strict';

/**
 * urlFeatureExtractor.js
 * Extracts structured features from a raw URL.
 * These features are what a real ML model would receive as input.
 * Keeping extraction separate from scoring makes it easy to feed
 * the same features to a Python model, TensorFlow.js, or an API.
 */

const { SUSPICIOUS_TLDS, URL_PHISHING_KEYWORDS: PHISHING_KEYWORDS } = require('./constants');

/**
 * @param {string} rawUrl
 * @returns {object} Feature vector
 */
function extractUrlFeatures(rawUrl) {
  const urlStr = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;

  let parsed = null;
  let parseError = false;
  try {
    parsed = new URL(urlStr);
  } catch {
    parseError = true;
  }

  if (parseError || !parsed) {
    return {
      raw: rawUrl,
      parseError: true,
      isHttps: false,
      hostname: '',
      isIpAddress: false,
      suspiciousTld: null,
      subdomainCount: 0,
      hasHyphenInDomain: false,
      matchedKeywords: [],
      urlLength: rawUrl.length,
      hasUrlEncoding: false,
      pathDepth: 0,
      hasPort: false,
      linkCount: 0,
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const fullUrl  = rawUrl.toLowerCase();
  const domainParts = hostname.split('.');

  return {
    raw:               rawUrl,
    parseError:        false,
    isHttps:           parsed.protocol === 'https:',
    hostname,
    isIpAddress:       /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname),
    suspiciousTld:     SUSPICIOUS_TLDS.find((tld) => hostname.endsWith(tld)) || null,
    subdomainCount:    Math.max(0, domainParts.length - 2),
    hasHyphenInDomain: /-/.test(domainParts[0]),
    matchedKeywords:   PHISHING_KEYWORDS.filter((kw) => fullUrl.includes(kw)),
    urlLength:         rawUrl.length,
    hasUrlEncoding:    /%[0-9a-f]{2}/i.test(rawUrl),
    pathDepth:         parsed.pathname.split('/').filter(Boolean).length,
    hasPort:           !!parsed.port,
    linkCount:         0, // N/A for URL itself
  };
}

module.exports = { extractUrlFeatures };
