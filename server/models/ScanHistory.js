'use strict';

const mongoose = require('mongoose');

/**
 * ScanHistory
 * Stores every individual scan — URL, email, or SMS.
 */
const scanHistorySchema = new mongoose.Schema(
  {
    // ── Input ──────────────────────────────────────────────────────────────
    type: {
      type: String,
      enum: {
        values: ['url', 'email', 'sms'],
        message: 'type must be one of: url, email, sms',
      },
      required: [true, 'Scan type is required'],
    },

    inputData: {
      type: String,
      required: [true, 'inputData is required'],
      trim: true,
      minlength: [1,    'inputData cannot be empty'],
      maxlength: [5000, 'inputData must not exceed 5000 characters'],
    },

    // ── Detection result ───────────────────────────────────────────────────
    result: {
      type: String,
      enum: {
        values: ['safe', 'suspicious', 'phishing'],
        message: 'result must be one of: safe, suspicious, phishing',
      },
      required: [true, 'result is required'],
    },

    riskScore: {
      type: Number,
      required: [true, 'riskScore is required'],
      min: [0,   'riskScore cannot be less than 0'],
      max: [100, 'riskScore cannot exceed 100'],
      default: 0,
    },

    reasons: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 20,
        message: 'reasons array must not exceed 20 entries',
      },
    },
  },
  {
    // Adds createdAt + updatedAt automatically
    timestamps: true,
    // Clean JSON output — remove __v
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  }
);

// ── Indexes ────────────────────────────────────────────────────────────────
scanHistorySchema.index({ result: 1, createdAt: -1 }); // dashboard queries
scanHistorySchema.index({ type: 1 });                   // filter by type
scanHistorySchema.index({ createdAt: -1 });             // default sort

// ── Virtual: isPhishing ────────────────────────────────────────────────────
scanHistorySchema.virtual('isPhishing').get(function () {
  return this.result !== 'safe';
});

// ── Post-save hook: keep ThreatStats in sync ───────────────────────────────
scanHistorySchema.post('save', async function (doc) {
  try {
    const ThreatStats = mongoose.model('ThreatStats');
    const inc = {
      totalScans: 1,
      ...(doc.result === 'phishing'   && { phishingDetected: 1 }),
      ...(doc.result === 'safe'       && { safeCount: 1 }),
      ...(doc.result === 'suspicious' && { suspiciousCount: 1 }),
    };
    await ThreatStats.findOneAndUpdate(
      {},                                    // single global stats document
      { $inc: inc, $set: { updatedAt: new Date() } },
      { upsert: true, new: true }
    );
  } catch (err) {
    // Non-fatal — log but don't crash the request
    console.error('[ScanHistory hook] Failed to update ThreatStats:', err.message);
  }
});

module.exports = mongoose.model('ScanHistory', scanHistorySchema);
