'use strict';

/**
 * corsConfig.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Centralised CORS configuration.
 *
 * Three origin tiers:
 *   1. Web app   — React dev server / production domain
 *   2. Extension — chrome-extension:// and moz-extension:// schemes
 *   3. Open      — /api/extension/* routes are open to any extension origin
 *
 * .env keys:
 *   CLIENT_ORIGIN          React app origin  (default: http://localhost:3000)
 *   SERVER_ORIGIN          Backend origin for same-host API calls (default: http://localhost:5000)
 *   ALLOWED_ORIGINS        Comma-separated extra origins
 *   EXTENSION_OPEN_CORS    Set to 'true' to allow any extension origin on
 *                          /api/extension/* without listing IDs (dev convenience)
 * ──────────────────────────────────────────────────────────────────────────────
 */

const cors = require('cors');

// ── Build allowed origin list ─────────────────────────────────────────────────
function normalizeOrigin(origin) {
  if (!origin) return origin;
  return origin.trim().replace(/\/+$/, '');
}

function buildAllowedOrigins() {
  const origins = new Set();

  // React web app
  origins.add(normalizeOrigin(process.env.CLIENT_ORIGIN || 'http://localhost:3000'));

  // Backend origin (same host) — useful for same-port API requests
  origins.add(normalizeOrigin(process.env.SERVER_ORIGIN || `http://localhost:${process.env.PORT || '5000'}`));

  // Extra origins from env (comma-separated)
  if (process.env.ALLOWED_ORIGINS) {
    process.env.ALLOWED_ORIGINS.split(',').forEach((o) => origins.add(normalizeOrigin(o)));
  }

  return [...origins];
}

const ALLOWED_ORIGINS = buildAllowedOrigins();

// ── Standard CORS (web app + listed origins) ──────────────────────────────────
const standardCors = cors({
  origin(origin, callback) {
    // Allow requests with no origin (server-to-server, curl, Postman)
    if (!origin) return callback(null, true);

    // Allow any browser extension origin
    if (origin.startsWith('chrome-extension://') || origin.startsWith('moz-extension://')) {
      return callback(null, true);
    }

    if (ALLOWED_ORIGINS.includes(normalizeOrigin(origin))) {
      return callback(null, true);
    }

    callback(new Error(`CORS: origin "${origin}" is not allowed`));
  },
  methods:          ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders:   ['Content-Type', 'X-Extension-ID', 'X-Client-Version'],
  exposedHeaders:   ['X-Request-ID'],
  credentials:      false,
  maxAge:           600,   // preflight cache: 10 minutes
});

// ── Extension-open CORS (for /api/extension/* routes) ────────────────────────
// Allows any origin so the extension works without hardcoding its ID.
const extensionCors = cors({
  origin:         true,   // reflect request origin
  methods:        ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Extension-ID', 'X-Client-Version'],
  credentials:    false,
  maxAge:         600,
});

module.exports = { standardCors, extensionCors };
