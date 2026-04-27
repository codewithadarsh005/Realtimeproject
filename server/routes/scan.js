var express  = require('express');
var router   = express.Router();

var { scanUrl, scanMessage }         = require('../controllers/scanController');
var { validateUrl, validateMessage } = require('../middleware/validate');
var { scanLimiter }                  = require('../middleware/rateLimiter');

/**
 * POST /api/scan/url
 * Scan a URL for phishing indicators.
 */
router.post('/url', scanLimiter, validateUrl, scanUrl);

/**
 * POST /api/scan/message
 * Analyse an email or SMS message.
 */
router.post('/message', scanLimiter, validateMessage, scanMessage);

module.exports = router;
