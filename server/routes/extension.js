'use strict';

/**
 * extension.js — Routes for browser extension clients
 * Base: /api/extension
 */

var express = require('express');
var router  = express.Router();

var { extensionCors }                        = require('../middleware/corsConfig');
var { scanLimiter, apiLimiter }              = require('../middleware/rateLimiter');
var { quickCheck, scanUrl, scanMessage }     = require('../controllers/extensionController');

// Apply open CORS to all extension routes
router.use(extensionCors);

// Handle preflight for all routes
router.options('*', extensionCors);

/**
 * GET /api/extension/check?url=<encoded_url>
 * Lightweight quick-check — no DB write, < 200 ms target.
 */
router.get('/check', apiLimiter, quickCheck);

/**
 * POST /api/extension/scan/url
 * Full URL scan with DB persistence.
 */
router.post('/scan/url', scanLimiter, scanUrl);

/**
 * POST /api/extension/scan/message
 * Email / SMS analysis.
 */
router.post('/scan/message', scanLimiter, scanMessage);

module.exports = router;
