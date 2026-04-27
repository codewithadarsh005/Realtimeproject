'use strict';


var createError  = require('http-errors');
var express      = require('express');
var cookieParser = require('cookie-parser');
var logger       = require('morgan');

var connectDB    = require('./config/db');
var { standardCors } = require('./middleware/corsConfig');
var errorHandler = require('./middleware/errorHandler');

// ── Route modules ─────────────────────────────────────────────────────────────
var scanRouter      = require('./routes/scan');
var dashboardRouter = require('./routes/dashboard');
var historyRouter   = require('./routes/history');
var extensionRouter = require('./routes/extension');   // browser extension API
var threatsRouter   = require('./routes/threats');     // legacy compat

var app = express();

// ── Connect to MongoDB ────────────────────────────────────────────────────────
connectDB();

// ── Core middleware ───────────────────────────────────────────────────────────
app.use(logger(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Apply standard CORS globally (extension routes override with extensionCors)
app.use(standardCors);
app.options('*', standardCors);   // handle preflight for all routes

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', function (req, res) {
  res.json({
    success:    true,
    status:     'ok',
    prediction: null,
    riskScore:  null,
    reasons:    [],
    threatIntel: null,
    timestamp:  new Date().toISOString(),
  });
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/scan',      scanRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/history',   historyRouter);
app.use('/api/extension', extensionRouter);   // browser extension endpoints
app.use('/api/threats',   threatsRouter);     // backwards compat

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use(function (req, res, next) {
  next(createError(404, `Route ${req.method} ${req.path} not found`));
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
