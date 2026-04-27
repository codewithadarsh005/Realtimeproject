'use strict';

const ScanHistory              = require('../models/ScanHistory');
const phishingDetectionService = require('../services/phishingDetectionService');

/**
 * Consistent response envelope used by all scan endpoints.
 * Browser extension and web app both consume this shape.
 */
function buildResponse(record, threatIntel) {
  return {
    success:    true,
    prediction: record.result,       // 'safe' | 'suspicious' | 'phishing'
    riskScore:  record.riskScore,    // 0-100
    reasons:    record.reasons,      // string[]
    threatIntel: threatIntel
      ? {
          isThreat:   threatIntel.isThreat,
          confidence: threatIntel.confidence,
          matches:    threatIntel.matches.map((m) => ({
            source:       m.source,
            confidence:   m.confidence,
            category:     m.category,
            matchType:    m.matchType,
            matchedValue: m.matchedValue,
          })),
        }
      : null,
    // Full record metadata
    data: {
      id:        record._id,
      type:      record.type,
      inputData: record.inputData,
    },
    inputData: record.inputData,
    timestamp: record.createdAt.toISOString(),
  };
}

/**
 * POST /api/scan/url
 * Body: { url: string }
 */
const scanUrl = async (req, res, next) => {
  try {
    const { url } = req.body;

    const { result, riskScore, reasons, threatIntel } =
      await phishingDetectionService.analyseUrl(url);

    const record = await ScanHistory.create({
      type: 'url', inputData: url, result, riskScore, reasons,
    });

    res.status(201).json(buildResponse(record, threatIntel));
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/scan/message
 * Body: { message: string, type: 'email' | 'sms' }
 */
const scanMessage = async (req, res, next) => {
  try {
    const { message, type = 'email' } = req.body;

    const { result, riskScore, reasons } =
      await phishingDetectionService.analyseMessage(message, type);

    const record = await ScanHistory.create({
      type: type === 'sms' ? 'sms' : 'email', inputData: message, result, riskScore, reasons,
    });

    res.status(201).json(buildResponse(record, null));
  } catch (err) {
    next(err);
  }
};

module.exports = { scanUrl, scanMessage };
