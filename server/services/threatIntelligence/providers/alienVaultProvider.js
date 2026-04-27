'use strict';

/**
 * alienVaultProvider.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Stub for AlienVault OTX (Open Threat Exchange) integration.
 * https://otx.alienvault.com/api
 *
 * HOW TO ACTIVATE
 * ────────────────
 * 1. Create a free account at otx.alienvault.com
 * 2. Get your API key from Settings → API Key
 * 3. Set ALIENVAULT_ENABLED=true and ALIENVAULT_API_KEY=<key> in .env
 * 4. Replace the stub body below:
 *
 *    const axios = require('axios');
 *    const BASE  = 'https://otx.alienvault.com/api/v1';
 *
 *    async function checkUrl(url, parsed) {
 *      const hostname = parsed?.hostname;
 *      if (!hostname) return null;
 *
 *      const { data } = await axios.get(
 *        `${BASE}/indicators/domain/${hostname}/general`,
 *        { headers: { 'X-OTX-API-KEY': process.env.ALIENVAULT_API_KEY }, timeout: 8000 }
 *      );
 *
 *      const pulseCount = data.pulse_info?.count ?? 0;
 *      if (pulseCount > 0) {
 *        return { matched: true, source: 'AlienVault OTX', confidence: Math.min(60 + pulseCount * 5, 95),
 *                 category: data.pulse_info?.pulses?.[0]?.tags?.[0] ?? 'threat',
 *                 matchType: 'domain', matchedValue: hostname,
 *                 provider: 'AlienVault', pulseCount };
 *      }
 *      return null;
 *    }
 * ──────────────────────────────────────────────────────────────────────────────
 */

const ENABLED = process.env.ALIENVAULT_ENABLED === 'true';

/**
 * @param {string} url
 * @param {object|null} parsed
 * @returns {Promise<ThreatMatch | null>}
 */
async function checkUrl(url, parsed) {
  if (!ENABLED) return null;

  // TODO: implement real AlienVault OTX lookup
  console.warn('[AlienVaultProvider] Enabled but not yet implemented — returning null');
  return null;
}

module.exports = { checkUrl };
