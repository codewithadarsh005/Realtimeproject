'use strict';

/**
 * phishTankProvider.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Stub for PhishTank API integration.
 * https://www.phishtank.com/api_info.php
 *
 * HOW TO ACTIVATE
 * ────────────────
 * 1. Register at phishtank.com and get a free API key
 * 2. Set PHISHTANK_ENABLED=true and PHISHTANK_API_KEY=<key> in .env
 * 3. Replace the stub body below:
 *
 *    const axios = require('axios');
 *    const qs    = require('querystring');
 *
 *    async function checkUrl(url, parsed) {
 *      const { data } = await axios.post(
 *        'https://checkurl.phishtank.com/checkurl/',
 *        qs.stringify({
 *          url:    encodeURIComponent(url),
 *          format: 'json',
 *          app_key: process.env.PHISHTANK_API_KEY,
 *        }),
 *        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 8000 }
 *      );
 *      if (data.results?.in_database && data.results?.valid) {
 *        return { matched: true, source: 'PhishTank', confidence: 95,
 *                 category: 'phishing', matchType: 'url',
 *                 matchedValue: url, provider: 'PhishTank',
 *                 phishId: data.results.phish_id };
 *      }
 *      return null;
 *    }
 * ──────────────────────────────────────────────────────────────────────────────
 */

const ENABLED = process.env.PHISHTANK_ENABLED === 'true';

/**
 * @param {string} url
 * @param {object|null} parsed
 * @returns {Promise<ThreatMatch | null>}
 */
async function checkUrl(url, parsed) {
  if (!ENABLED) return null;

  // TODO: implement real PhishTank API lookup
  console.warn('[PhishTankProvider] Enabled but not yet implemented — returning null');
  return null;
}

module.exports = { checkUrl };
