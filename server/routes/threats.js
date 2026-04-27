'use strict';

/**
 * Legacy /api/threats routes — backwards compatibility with existing frontend.
 * Delegates to the new models internally.
 */
var express      = require('express');
var router       = express.Router();
var ThreatStats  = require('../models/ThreatStats');
var { getHistory } = require('../controllers/historyController');
var { clearCache } = require('../services/threatIntelligence/threatIntelligenceService');

// GET /api/threats  →  history list
router.get('/', function (req, res, next) {
  req.query.limit = req.query.limit || '50';
  getHistory(req, res, next);
});

// GET /api/threats/stats  →  flat totals (legacy shape)
router.get('/stats', async function (req, res, next) {
  try {
    const stats = await ThreatStats.getSingleton();
    res.json({
      success: true,
      data: {
        total:      stats.totalScans,
        phishing:   stats.phishingDetected,
        safe:       stats.safeCount,
        suspicious: stats.suspiciousCount,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/threats/cache/clear  →  clear threat intelligence cache
router.post('/cache/clear', async function (req, res, next) {
  try {
    clearCache();
    res.json({
      success: true,
      message: 'Threat intelligence cache cleared successfully'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
