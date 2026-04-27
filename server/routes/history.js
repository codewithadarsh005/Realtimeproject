var express  = require('express');
var router   = express.Router();

var { getHistory, deleteRecord } = require('../controllers/historyController');
var { apiLimiter }               = require('../middleware/rateLimiter');

/**
 * GET /api/history
 * Paginated scan history with optional filters.
 * Query: page, limit, type, status, sort
 */
router.get('/', apiLimiter, getHistory);

/**
 * DELETE /api/history/:id
 * Remove a single scan record by ID.
 */
router.delete('/:id', apiLimiter, deleteRecord);

module.exports = router;
