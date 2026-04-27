'use strict';

/**
 * openPhishProvider.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Stub for OpenPhish Community Feed integration.
 * https://openphish.com/
 *
 * HOW TO ACTIVATE
 * ────────────────
 * 1. Set OPENPHISH_ENABLED=true in .env
 * 2. (Premium) Set OPENPHISH_API_KEY=<your_key> for the authenticated feed
 * 3. Replace the stub body below with a real HTTP call:
 *
 *    const axios = require('axios');
 *    const FEED_URL = 'https://openphish.com/feed.txt';          // free
 *    // or: 'https://openphish.com/prvt_ipts/<API_KEY>/feed.txt' // premium
 *
 *    async function checkUrl(url, parsed) {
 *      const { data } = await axios.get(FEED_URL, { timeout: 5000 });
 *      const lines = data.split('\n').map(l => l.trim().toLowerCase());
 *      if (lines.includes(url.toLowerCase())) {
 *        return { matched: true, source: 'OpenPhish', confidence: 90,
 *                 category: 'phishing', matchType: 'url',
 *                 matchedValue: url, provider: 'OpenPhish' };
 *      }
 *      return null;
 *    }
 *
 * NOTE: Cache the feed locally (e.g. refresh every 30 min) to avoid
 *       hammering the endpoint on every scan request.
 * ──────────────────────────────────────────────────────────────────────────────
 */

const ENABLED = process.env.OPENPHISH_ENABLED === 'true';

/**
 * @param {string} url
 * @param {object|null} parsed
 * @returns {Promise<ThreatMatch | null>}
 */
async function checkUrl(url, parsed) {
  if (!ENABLED) return null;

  // TODO: implement real OpenPhish feed lookup
  console.warn('[OpenPhishProvider] Enabled but not yet implemented — returning null');
  return null;
}

module.exports = { checkUrl };
