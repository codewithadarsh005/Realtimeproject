'use strict';

/**
 * constants.js — Shared ML feature constants
 * Single source of truth used by both feature extractors and classifiers.
 */

const SUSPICIOUS_TLDS = [
  '.xyz', '.tk', '.ml', '.ga', '.cf', '.gq',
  '.top', '.click', '.link', '.work', '.party',
];

const URL_PHISHING_KEYWORDS = [
  'login', 'verify', 'secure', 'account', 'update', 'confirm',
  'banking', 'paypal', 'amazon', 'apple', 'microsoft', 'google',
  'password', 'credential', 'signin', 'suspended', 'unlock',
  'webscr', 'ebayisapi', 'cmd=_login',
];

const MESSAGE_PHISHING_PATTERNS = [
  { id: 'account_verification', pattern: /verify your account/i,               weight: 20, label: 'Requests account verification' },
  { id: 'click_here',           pattern: /click here/i,                         weight: 10, label: 'Generic "click here" call-to-action' },
  { id: 'urgency',              pattern: /urgent|immediately|act now/i,         weight: 18, label: 'Creates artificial urgency' },
  { id: 'password_reset',       pattern: /password reset/i,                     weight: 15, label: 'Requests password reset' },
  { id: 'account_threat',       pattern: /suspended|locked|disabled/i,          weight: 20, label: 'Threatens account suspension' },
  { id: 'personal_confirm',     pattern: /confirm your (details|info|account)/i, weight: 18, label: 'Requests personal confirmation' },
  { id: 'time_pressure',        pattern: /limited time|expires soon/i,          weight: 12, label: 'Artificial time pressure' },
  { id: 'financial_creds',      pattern: /bank account|credit card/i,           weight: 20, label: 'References financial credentials' },
  { id: 'govt_id',              pattern: /social security|ssn/i,                weight: 25, label: 'Requests government ID information' },
  { id: 'prize_scam',           pattern: /won a prize|you have won|claim your/i, weight: 22, label: 'Prize or reward scam pattern' },
  { id: 'insecure_link',        pattern: /http:\/\//i,                          weight: 15, label: 'Contains non-HTTPS link' },
  { id: 'generic_greeting',     pattern: /dear (customer|user|member)/i,        weight: 8,  label: 'Generic impersonal greeting' },
  { id: 'payment_update',       pattern: /update your (payment|billing|card)/i, weight: 20, label: 'Requests payment information update' },
  { id: 'otp_intercept',        pattern: /\b(otp|one.time.password)\b/i,        weight: 18, label: 'References one-time password' },
  { id: 'credential_request',   pattern: /enter your (password|username|pin)/i, weight: 22, label: 'Directly requests credentials' },
  { id: 'impersonation',        pattern: /\b(paypal|amazon|apple|microsoft|google|netflix|bank)\b/i, weight: 10, label: 'Impersonates a known brand' },
];

module.exports = { SUSPICIOUS_TLDS, URL_PHISHING_KEYWORDS, MESSAGE_PHISHING_PATTERNS };
