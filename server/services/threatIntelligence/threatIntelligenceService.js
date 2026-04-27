'use strict';

/**
 * threatIntelligenceService.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Aggregates results from all threat intelligence providers.
 * Controllers and other services call ONLY this file.
 *
 * Adding a new provider:
 *   1. Create providers/myNewProvider.js with a checkUrl(url, parsed) function
 *   2. Add it to the PROVIDERS array below — nothing else changes
 * ──────────────────────────────────────────────────────────────────────────────
 */

const localProvider      = require('./providers/localProvider');
const openPhishProvider  = require('./providers/openPhishProvider');
const phishTankProvider  = require('./providers/phishTankProvider');
const alienVaultProvider = require('./providers/alienVaultProvider');
const urlhausProvider    = require('./providers/urlhausProvider');

// ── Provider registry — order matters (first match wins for deduplication) ────
const PROVIDERS = [
  localProvider,
  openPhishProvider,
  phishTankProvider,
  alienVaultProvider,
  urlhausProvider,
];

// ── Simple in-memory cache for threat intelligence results ────────────────────
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const threatCache = new Map();

/**
 * Parse a URL safely.
 * @param {string} rawUrl
 * @returns {URL|null}
 */
function safeParse(rawUrl) {
  try {
    const urlStr = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
    return new URL(urlStr);
  } catch {
    return null;
  }
}

/**
 * Get cached result or null if expired/missing.
 * @param {string} cacheKey
 * @returns {object|null}
 */
function getCachedResult(cacheKey) {
  const cached = threatCache.get(cacheKey);
  if (!cached) return null;

  const now = Date.now();
  if (now - cached.timestamp > CACHE_TTL) {
    threatCache.delete(cacheKey);
    return null;
  }

  return cached.result;
}

/**
 * Cache a threat intelligence result.
 * @param {string} cacheKey
 * @param {object} result
 */
function setCachedResult(cacheKey, result) {
  threatCache.set(cacheKey, {
    result,
    timestamp: Date.now()
  });
}

/**
 * Check a URL against all registered threat intelligence providers.
 *
 * @param {string} url
 * @returns {Promise<ThreatIntelResult>}
 *
 * ThreatIntelResult shape:
 * {
 *   isThreat:   boolean,
 *   confidence: number,          // highest confidence across all matches
 *   matches: [{
 *     source:       string,      // 'OpenPhish' | 'PhishTank' | 'AlienVault' | 'Local'
 *     confidence:   number,
 *     category:     string,
 *     matchType:    string,      // 'url' | 'domain' | 'ip' | 'keyword'
 *     matchedValue: string,
 *     provider:     string,
 *     addedAt:      string|null,
 *   }],
 *   threatReasons: string[],     // human-readable strings for the scan response
 * }
 */
async function checkUrl(url) {
  const parsed = safeParse(url);
  const cacheKey = `threat:${url.toLowerCase()}`;

  // Check cache first
  const cachedResult = getCachedResult(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }

  // Run all providers in parallel — non-fatal errors are caught per-provider
  const results = await Promise.all(
    PROVIDERS.map(async (provider) => {
      try {
        return await provider.checkUrl(url, parsed);
      } catch (err) {
        console.error(`[ThreatIntel] Provider error (${provider.constructor?.name ?? 'unknown'}):`, err.message);
        return null;
      }
    })
  );

  // Filter nulls (no match or disabled provider)
  const matches = results.filter(Boolean);

  if (matches.length === 0) {
    const noThreatResult = { isThreat: false, confidence: 0, matches: [], threatReasons: [] };
    setCachedResult(cacheKey, noThreatResult);
    return noThreatResult;
  }

  // Highest confidence across all matches
  const topConfidence = Math.max(...matches.map((m) => m.confidence));

  // Build human-readable reason strings
  const threatReasons = matches.map(
    (m) => `Listed in ${m.source} as "${m.category}" (matched ${m.matchType}: ${m.matchedValue})`
  );

  const threatResult = {
    isThreat:     true,
    confidence:   topConfidence,
    matches,
    threatReasons,
  };

  // Cache the result
  setCachedResult(cacheKey, threatResult);

  return threatResult;
}

/**
 * Clear the threat intelligence cache.
 * Useful for testing or when updating indicator data.
 */
function clearCache() {
  threatCache.clear();
  console.log('[ThreatIntel] Cache cleared');
}

module.exports = { checkUrl, clearCache };
