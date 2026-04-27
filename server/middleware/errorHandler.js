'use strict';

/**
 * errorHandler.js
 * Global error handler — registered last in the Express middleware chain.
 * Always returns the consistent envelope so browser extensions can rely on
 * { success, prediction, riskScore, reasons, timestamp } being present.
 */
const errorHandler = (err, req, res, next) => {
  let status  = err.statusCode || err.status || 500;
  let message = err.message    || 'Internal Server Error';

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    status  = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    status  = 400;
    message = 'Invalid ID format';
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    status  = 409;
    message = 'Duplicate entry';
  }

  // CORS rejection
  if (message.startsWith('CORS:')) {
    status  = 403;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error(`[ERROR] ${status} — ${message}`);
  }

  // Consistent envelope — same shape as success responses
  res.status(status).json({
    success:    false,
    prediction: null,
    riskScore:  null,
    reasons:    [],
    threatIntel: null,
    error:      message,
    timestamp:  new Date().toISOString(),
  });
};

module.exports = errorHandler;
