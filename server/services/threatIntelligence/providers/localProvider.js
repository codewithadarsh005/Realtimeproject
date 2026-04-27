'use strict';

/**
 * localProvider.js
 * Queries the local mock indicator database (mockIndicators.json).
 * This is the default provider — always active, no API key needed.
 *
 * Returns the same shape as all other providers so the aggregator
 * can treat them uniformly.
 */

const indicators = require('../indicators/mockIndicators.json');

const SOURCE_NAME = 'Local';

/**
 * @param {string} url      Raw URL string
 * @param {object} parsed   Parsed URL object { hostname, ... } or null
 * @returns {ThreatMatch | null}
 */
function checkUrl(url, parsed) {
  const urlLower = url.toLowerCase();

  // 1. Exact URL match
  const urlMatch = indicators.urls.find(
    (i) => i.value.toLowerCase() === urlLower
  );
  if (urlMatch) {
    return buildMatch(urlMatch, 'url', urlMatch.value);
  }

  // 2. Domain match
  if (parsed?.hostname) {
    const hostname = parsed.hostname.toLowerCase();
    const domainMatch = indicators.domains.find(
      (i) => hostname === i.value.toLowerCase() || hostname.endsWith('.' + i.value.toLowerCase())
    );
    if (domainMatch) {
      return buildMatch(domainMatch, 'domain', domainMatch.value);
    }
  }

  // 3. IP match
  if (parsed?.hostname && /^\d{1,3}(\.\d{1,3}){3}$/.test(parsed.hostname)) {
    const ipMatch = indicators.ips.find((i) => i.value === parsed.hostname);
    if (ipMatch) {
      return buildMatch(ipMatch, 'ip', ipMatch.value);
    }
  }

  // 4. Keyword match in URL path/query
  const keywordMatch = indicators.keywords.find(
    (i) => urlLower.includes(i.value.toLowerCase())
  );
  if (keywordMatch) {
    return buildMatch(keywordMatch, 'keyword', keywordMatch.value);
  }

  return null;
}

function buildMatch(indicator, matchType, matchedValue) {
  return {
    matched:      true,
    source:       indicator.source || SOURCE_NAME,
    confidence:   indicator.confidence,
    category:     indicator.category,
    matchType,                          // 'url' | 'domain' | 'ip' | 'keyword'
    matchedValue,
    addedAt:      indicator.addedAt || null,
    provider:     SOURCE_NAME,
  };
}

module.exports = { checkUrl };
