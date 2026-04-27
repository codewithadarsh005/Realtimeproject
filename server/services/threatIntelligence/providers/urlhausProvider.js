'use strict';

/**
 * urlhausProvider.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Integration with URLhaus (https://urlhaus.abuse.ch/)
 * URLhaus is a project from abuse.ch that provides a database of malicious URLs.
 *
 * HOW TO ACTIVATE
 * ────────────────
 * 1. Set URLHAUS_ENABLED=true in .env
 * 2. (Optional) Set URLHAUS_API_KEY=<your_key> for higher rate limits
 * 3. The provider will query the URLhaus API for URL lookups
 *
 * API Documentation: https://urlhaus-api.abuse.ch/
 * ──────────────────────────────────────────────────────────────────────────────
 */

const axios = require('axios');

const ENABLED = process.env.URLHAUS_ENABLED === 'true';
const API_KEY = process.env.URLHAUS_API_KEY;
const BASE_URL = 'https://urlhaus-api.abuse.ch/v1';

const SOURCE_NAME = 'URLhaus';

/**
 * @param {string} url
 * @param {object|null} parsed
 * @returns {Promise<ThreatMatch | null>}
 */
async function checkUrl(url, parsed) {
  if (!ENABLED) return null;

  try {
    // URLhaus expects URLs with protocol
    const urlWithProtocol = url.startsWith('http') ? url : `http://${url}`;

    const params = {
      url: urlWithProtocol,
    };

    if (API_KEY) {
      params.apikey = API_KEY;
    }

    const response = await axios.get(`${BASE_URL}/url/`, {
      params,
      timeout: 5000,
      headers: {
        'User-Agent': 'AI-Phishing-Detection/1.0'
      }
    });

    const data = response.data;

    if (data.query_status === 'ok' && data.url_status?.urlhaus_reference) {
      // URL found in URLhaus database
      return {
        matched: true,
        source: SOURCE_NAME,
        confidence: 92, // URLhaus has high confidence for confirmed malicious URLs
        category: data.url_status.threat || 'malware',
        matchType: 'url',
        matchedValue: url,
        addedAt: data.url_status.date_added || null,
        provider: SOURCE_NAME,
      };
    }

    // URL not found or not malicious
    return null;

  } catch (error) {
    console.warn(`[URLhausProvider] API error: ${error.message}`);
    return null;
  }
}

module.exports = { checkUrl };