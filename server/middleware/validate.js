'use strict';

/**
 * validate.js — Request validators
 * All errors use the standard envelope: { success, error, timestamp }
 * so the frontend and browser extension always get a consistent shape.
 */

const mongoose = require('mongoose');

/** Standard error response — matches errorHandler.js envelope */
function validationError(res, status, message) {
  return res.status(status).json({
    success:    false,
    prediction: null,
    riskScore:  null,
    reasons:    [],
    threatIntel: null,
    error:      message,
    timestamp:  new Date().toISOString(),
  });
}

/** POST /api/scan/url — validates { url } body */
const validateUrl = (req, res, next) => {
  const { url } = req.body;

  if (!url || typeof url !== 'string' || !url.trim())
    return validationError(res, 400, 'url is required');

  if (url.trim().length > 2048)
    return validationError(res, 400, 'url exceeds maximum length of 2048 characters');

  const urlPattern = /^(https?:\/\/)?[\w\-]+(\.[\w\-]+)+([\w\-._~:/?#[\]@!$&'()*+,;=%]*)?$/i;
  if (!urlPattern.test(url.trim()))
    return validationError(res, 400, 'url does not appear to be a valid URL');

  req.body.url = url.trim();
  next();
};

/** POST /api/scan/message — validates { message, type? } body */
const validateMessage = (req, res, next) => {
  const { message, type } = req.body;

  if (!message || typeof message !== 'string' || !message.trim())
    return validationError(res, 400, 'message is required');

  if (message.trim().length > 5000)
    return validationError(res, 400, 'message exceeds maximum length of 5000 characters');

  if (type && !['email', 'sms'].includes(type))
    return validationError(res, 400, 'type must be "email" or "sms"');

  req.body.message = message.trim();
  next();
};

/** DELETE /api/history/:id — validates MongoDB ObjectId */
const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return validationError(res, 400, 'Invalid record ID format');
  next();
};

/** GET /api/history — sanitises and coerces query params */
const validateHistoryQuery = (req, res, next) => {
  const { page, limit, type, result, sort } = req.query;

  if (page && (isNaN(page) || Number(page) < 1))
    return validationError(res, 400, 'page must be a positive integer');

  if (limit && (isNaN(limit) || Number(limit) < 1 || Number(limit) > 100))
    return validationError(res, 400, 'limit must be between 1 and 100');

  if (type && !['url', 'email', 'sms'].includes(type))
    return validationError(res, 400, 'type must be one of: url, email, sms');

  if (result && !['safe', 'suspicious', 'phishing'].includes(result))
    return validationError(res, 400, 'result must be one of: safe, suspicious, phishing');

  if (sort && !['newest', 'oldest', 'riskScore'].includes(sort))
    return validationError(res, 400, 'sort must be one of: newest, oldest, riskScore');

  next();
};

module.exports = { validateUrl, validateMessage, validateObjectId, validateHistoryQuery };
