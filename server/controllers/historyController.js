'use strict';

const ScanHistory = require('../models/ScanHistory');

/**
 * GET /api/history
 * Paginated scan history with optional filters.
 *
 * Query params:
 *   page     (default 1)
 *   limit    (default 20, max 100)
 *   type     'url' | 'email' | 'sms'
 *   result   'safe' | 'suspicious' | 'phishing'
 *   sort     'newest' (default) | 'oldest' | 'riskScore'
 */
const getHistory = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip  = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (req.query.type   && ['url', 'email', 'sms'].includes(req.query.type))
      filter.type = req.query.type;
    if (req.query.result && ['safe', 'suspicious', 'phishing'].includes(req.query.result))
      filter.result = req.query.result;
    // Legacy: support ?status= from old frontend
    if (req.query.status && ['safe', 'suspicious', 'phishing'].includes(req.query.status))
      filter.result = req.query.status;

    // Build sort
    const sortMap = {
      newest:    { createdAt: -1 },
      oldest:    { createdAt:  1 },
      riskScore: { riskScore: -1 },
    };
    const sort = sortMap[req.query.sort] || sortMap.newest;

    const [records, total] = await Promise.all([
      ScanHistory.find(filter).sort(sort).skip(skip).limit(limit).select('-__v'),
      ScanHistory.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: records,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/history/:id
 * Remove a single scan record by ID.
 */
const deleteRecord = async (req, res, next) => {
  try {
    const record = await ScanHistory.findByIdAndDelete(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    res.json({ success: true, message: 'Record deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getHistory, deleteRecord };
