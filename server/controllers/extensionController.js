'use strict';

/**
 * extensionController.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Lightweight endpoints designed for browser extension consumption.
 *
 * Design goals:
 *   • No DB write on quick-check (keeps latency < 200 ms)
 *   • Consistent envelope: { success, prediction, riskScore, reasons, timestamp }
 *   • All errors return the same envelope shape with success: false
 * ──────────────────────────────────────────────────────────────────────────────
 */

const phishingDetectionService = require('../services/phishingDetectionService');
const ScanHistory              = require('../models/ScanHistory');

/**
 * Build the standard extension response envelope.
 */
function buildResponse({ success = true, prediction, riskScore, reasons, threatIntel, url, message, error }) {
  return {
    success,
    prediction:  prediction  ?? null,   // 'safe' | 'suspicious' | 'phishing' | null
    riskScore:   riskScore   ?? null,   // 0-100 | null
    reasons:     reasons     ?? [],
    threatIntel: threatIntel ?? null,
    ...(url     && { url }),
    ...(message && { message }),
    ...(error   && { error }),
    timestamp: new Date().toISOString(),
  };
}

/**
 * GET /api/extension/check?url=<encoded_url>
 *
 * Quick URL check — no DB write, minimal payload.
 * Designed for the extension to call on every page load.
 */
const quickCheck = async (req, res, next) => {
  try {
    const url = req.query.url;

    if (!url || typeof url !== 'string' || !url.trim()) {
      return res.status(400).json(buildResponse({
        success: false,
        error:   'url query parameter is required',
      }));
    }

    if (url.trim().length > 2048) {
      return res.status(400).json(buildResponse({
        success: false,
        error:   'url exceeds maximum length of 2048 characters',
      }));
    }

    const { result, riskScore, reasons, threatIntel } =
      await phishingDetectionService.analyseUrl(url.trim());

    return res.json(buildResponse({
      prediction: result,
      riskScore,
      reasons,
      threatIntel: {
        isThreat:   threatIntel.isThreat,
        confidence: threatIntel.confidence,
        matches:    threatIntel.matches.map((m) => ({
          source:       m.source,
          confidence:   m.confidence,
          category:     m.category,
          matchType:    m.matchType,
          matchedValue: m.matchedValue,
        })),
      },
      url: url.trim(),
    }));
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/extension/scan/url
 *
 * Full URL scan — writes to DB, returns complete result.
 * Used when the user explicitly requests a scan from the extension popup.
 */
const scanUrl = async (req, res, next) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string' || !url.trim()) {
      return res.status(400).json(buildResponse({
        success: false,
        error:   'url is required',
      }));
    }

    const { result, riskScore, reasons, threatIntel } =
      await phishingDetectionService.analyseUrl(url.trim());

    // Persist to history (fire-and-forget — don't block the response)
    ScanHistory.create({
      type:      'url',
      inputData: url.trim(),
      result,
      riskScore,
      reasons,
    }).catch((err) => console.error('[ExtensionController] DB write failed:', err.message));

    return res.status(201).json(buildResponse({
      prediction: result,
      riskScore,
      reasons,
      threatIntel: {
        isThreat:   threatIntel.isThreat,
        confidence: threatIntel.confidence,
        matches:    threatIntel.matches.map((m) => ({
          source:       m.source,
          confidence:   m.confidence,
          category:     m.category,
          matchType:    m.matchType,
          matchedValue: m.matchedValue,
        })),
      },
      url: url.trim(),
    }));
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/extension/scan/message
 *
 * Analyse email or SMS text from the extension.
 */
const scanMessage = async (req, res, next) => {
  try {
    const { message, type = 'email' } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json(buildResponse({
        success: false,
        error:   'message is required',
      }));
    }

    const { result, riskScore, reasons } =
      await phishingDetectionService.analyseMessage(message.trim(), type);

    ScanHistory.create({
      type:      type === 'sms' ? 'sms' : 'email',
      inputData: message.trim(),
      result,
      riskScore,
      reasons,
    }).catch((err) => console.error('[ExtensionController] DB write failed:', err.message));

    return res.status(201).json(buildResponse({
      prediction: result,
      riskScore,
      reasons,
      message: message.trim(),
    }));
  } catch (err) {
    next(err);
  }
};

module.exports = { quickCheck, scanUrl, scanMessage };
