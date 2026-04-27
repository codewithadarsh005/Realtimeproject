'use strict';

/**
 * modelAdapter.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Routes prediction requests to the correct backend based on .env config.
 *
 * MODE SELECTION (set in .env)
 * ─────────────────────────────
 *  ML_MODE=mock    (default) — pure JS mock classifiers, no Python needed
 *  ML_MODE=python            — spawns python/predict.py via child_process
 *  ML_MODE=rest              — HTTP POST to a running Python REST API
 *                              requires ML_BACKEND_URL=http://localhost:8000
 *
 * FALLBACK BEHAVIOUR
 * ───────────────────
 *  python mode: if the script fails / times out → falls back to mock
 *  rest   mode: if the HTTP call fails          → falls back to mock
 *  mock   mode: no fallback needed
 * ──────────────────────────────────────────────────────────────────────────────
 */

const axios = require('axios');

const { classifyUrl }        = require('./mockUrlClassifier');
const { classifyMessage }    = require('./mockMessageClassifier');
const { runPythonPredictor } = require('./pythonBridge');

// ── Mode resolution ───────────────────────────────────────────────────────────
const ML_MODE        = (process.env.ML_MODE || 'mock').toLowerCase();
const ML_BACKEND_URL = process.env.ML_BACKEND_URL || null;

const VALID_MODES = ['mock', 'python', 'rest'];
const activeMode  = VALID_MODES.includes(ML_MODE) ? ML_MODE : 'mock';

console.log(`[ModelAdapter] Mode: ${activeMode.toUpperCase()}${
  activeMode === 'rest' ? ` → ${ML_BACKEND_URL}` : ''
}`);

// ── Shared fallback ───────────────────────────────────────────────────────────
async function mockFallback(type, features) {
  console.warn(`[ModelAdapter] Falling back to MOCK for type="${type}"`);
  return type === 'url' ? classifyUrl(features) : classifyMessage(features);
}

// ── URL prediction ────────────────────────────────────────────────────────────

/**
 * @param {object} features  Output of extractUrlFeatures()
 * @returns {Promise<{ riskScore: number, reasons: string[] }>}
 */
async function predictUrl(features) {
  // ── MOCK ──────────────────────────────────────────────────────────────────
  if (activeMode === 'mock') {
    return classifyUrl(features);
  }

  // ── PYTHON (child process) ────────────────────────────────────────────────
  if (activeMode === 'python') {
    try {
      return await runPythonPredictor('url', features.raw);
    } catch (err) {
      console.error('[ModelAdapter] Python bridge error (url):', err.message);
      return mockFallback('url', features);
    }
  }

  // ── REST (HTTP to Python API) ─────────────────────────────────────────────
  if (activeMode === 'rest') {
    if (!ML_BACKEND_URL) {
      console.error('[ModelAdapter] ML_MODE=rest but ML_BACKEND_URL is not set. Falling back.');
      return mockFallback('url', features);
    }
    try {
      const { data } = await axios.post(`${ML_BACKEND_URL}/predict/url`, features, {
        timeout: 10000,
      });
      return {
        riskScore: Number(data.riskScore ?? data.risk_score ?? 0),
        reasons:   Array.isArray(data.reasons) ? data.reasons : [],
      };
    } catch (err) {
      console.error('[ModelAdapter] REST error (url):', err.message);
      return mockFallback('url', features);
    }
  }
}

// ── Message prediction ────────────────────────────────────────────────────────

/**
 * @param {object} features  Output of extractMessageFeatures()
 * @returns {Promise<{ riskScore: number, reasons: string[] }>}
 */
async function predictMessage(features) {
  // ── MOCK ──────────────────────────────────────────────────────────────────
  if (activeMode === 'mock') {
    return classifyMessage(features);
  }

  // ── PYTHON (child process) ────────────────────────────────────────────────
  if (activeMode === 'python') {
    try {
      return await runPythonPredictor('message', features.raw);
    } catch (err) {
      console.error('[ModelAdapter] Python bridge error (message):', err.message);
      return mockFallback('message', features);
    }
  }

  // ── REST (HTTP to Python API) ─────────────────────────────────────────────
  if (activeMode === 'rest') {
    if (!ML_BACKEND_URL) {
      console.error('[ModelAdapter] ML_MODE=rest but ML_BACKEND_URL is not set. Falling back.');
      return mockFallback('message', features);
    }
    try {
      const { data } = await axios.post(`${ML_BACKEND_URL}/predict/message`, features, {
        timeout: 10000,
      });
      return {
        riskScore: Number(data.riskScore ?? data.risk_score ?? 0),
        reasons:   Array.isArray(data.reasons) ? data.reasons : [],
      };
    } catch (err) {
      console.error('[ModelAdapter] REST error (message):', err.message);
      return mockFallback('message', features);
    }
  }
}

module.exports = { predictUrl, predictMessage };
