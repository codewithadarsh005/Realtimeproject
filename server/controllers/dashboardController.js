'use strict';

const ThreatStats = require('../models/ThreatStats');
const ScanHistory = require('../models/ScanHistory');

/**
 * GET /api/dashboard/stats
 * Returns ThreatStats singleton + daily activity breakdown.
 */
const getStats = async (req, res, next) => {
  try {
    // Get the singleton stats document (creates it if missing)
    const stats = await ThreatStats.getSingleton();

    // Last 7 days daily breakdown from ScanHistory
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const [dailyActivity, byType] = await Promise.all([
      ScanHistory.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id:      { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count:    { $sum: 1 },
            phishing: { $sum: { $cond: [{ $eq: ['$result', 'phishing'] }, 1, 0] } },
            safe:     { $sum: { $cond: [{ $eq: ['$result', 'safe'] }, 1, 0] } },
            suspicious: { $sum: { $cond: [{ $eq: ['$result', 'suspicious'] }, 1, 0] } },
            avgRiskScore: { $avg: '$riskScore' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      ScanHistory.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
    ]);

    // Reshape byType array → object
    const byTypeMap = byType.reduce((acc, t) => {
      acc[t._id] = t.count;
      return acc;
    }, { url: 0, email: 0, sms: 0 });

    res.json({
      success: true,
      data: {
        totals: {
          totalScans:       stats.totalScans,
          phishingDetected: stats.phishingDetected,
          safeCount:        stats.safeCount,
          suspiciousCount:  stats.suspiciousCount,
          updatedAt:        stats.updatedAt,
        },
        byType:  byTypeMap,
        daily:   dailyActivity,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats };
