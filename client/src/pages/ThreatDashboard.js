import React, { useEffect, useState, useCallback } from 'react';
import StatCard from '../components/StatCard';
import ChartPlaceholder from '../components/ChartPlaceholder';
import ErrorBanner from '../components/ErrorBanner';
import { fetchStats, fetchHistory, deleteHistoryRecord } from '../api/dashboardApi';
import './ThreatDashboard.css';

const FILTERS = ['all', 'phishing', 'suspicious', 'safe'];

// Map backend result field → display config
const RESULT_CONFIG = {
  safe:       { icon: '✅', label: 'Safe',       cls: 'safe' },
  suspicious: { icon: '⚠️', label: 'Suspicious', cls: 'suspicious' },
  phishing:   { icon: '🚨', label: 'Phishing',   cls: 'phishing' },
};

export default function ThreatDashboard() {
  const [stats,       setStats]       = useState(null);
  const [history,     setHistory]     = useState([]);
  const [pagination,  setPagination]  = useState(null);
  const [filter,      setFilter]      = useState('all');
  const [page,        setPage]        = useState(1);
  const [loadingStats,   setLoadingStats]   = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [statsError,     setStatsError]     = useState(null);
  const [historyError,   setHistoryError]   = useState(null);
  const [deletingId,     setDeletingId]     = useState(null);

  // ── Fetch stats ────────────────────────────────────────────────────────────
  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    setStatsError(null);
    try {
      const data = await fetchStats();
      setStats(data);
    } catch (err) {
      setStatsError(err.message);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // ── Fetch history ──────────────────────────────────────────────────────────
  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    setHistoryError(null);
    try {
      const params = { page, limit: 20, sort: 'newest' };
      if (filter !== 'all') params.result = filter;
      const res = await fetchHistory(params);
      setHistory(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setHistoryError(err.message);
    } finally {
      setLoadingHistory(false);
    }
  }, [filter, page]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { loadHistory(); }, [loadHistory]);

  // Reset to page 1 when filter changes
  const handleFilterChange = (f) => {
    setFilter(f);
    setPage(1);
  };

  // ── Delete record ──────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteHistoryRecord(id);
      setHistory((prev) => prev.filter((r) => r.id !== id));
      // Refresh stats after deletion
      loadStats();
    } catch {
      // silently ignore — record may already be gone
    } finally {
      setDeletingId(null);
    }
  };

  // ── Stat values from new backend shape ────────────────────────────────────
  const totals = stats?.totals ?? {};
  const daily = stats?.daily ?? [];
  const byType = stats?.byType ?? {};

  // ── Calculate threat distribution from all records ──────────────────────────
  const threatDistribution = daily.reduce(
    (acc, day) => ({
      phishing: acc.phishing + (day.phishing || 0),
      safe: acc.safe + (day.safe || 0),
      suspicious: acc.suspicious + (day.suspicious || 0),
    }),
    { phishing: 0, safe: 0, suspicious: 0 }
  );

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1 className="page-title">Threat Dashboard</h1>
        <p className="page-subtitle">Real-time overview of all scanned items and detected threats.</p>
      </div>

      {/* ── Stat cards ── */}
      {statsError && <ErrorBanner message={statsError} onRetry={loadStats} />}

      <div className="stats-grid">
        <StatCard
          icon="🔍"
          value={loadingStats ? '…' : (totals.totalScans ?? 0)}
          label="Total Scans"
          variant="info"
        />
        <StatCard
          icon="🚨"
          value={loadingStats ? '…' : (totals.phishingDetected ?? 0)}
          label="Phishing Detected"
          variant="danger"
        />
        <StatCard
          icon="✅"
          value={loadingStats ? '…' : (totals.safeCount ?? 0)}
          label="Safe Results"
          variant="safe"
        />
        <StatCard
          icon="⚠️"
          value={loadingStats ? '…' : (totals.suspiciousCount ?? 0)}
          label="Suspicious"
          variant="warning"
        />
      </div>

      {/* ── Charts ── */}
      <div className="charts-row">
        <ChartPlaceholder 
          title="Scan Activity (Last 7 Days)" 
          type="bar" 
          height={160} 
          data={daily}
        />
        <ChartPlaceholder 
          title="Threat Distribution" 
          type="donut" 
          height={160} 
          data={threatDistribution}
        />
        <ChartPlaceholder 
          title="Risk Score Trend" 
          type="line" 
          height={160} 
          data={daily}
        />
      </div>

      {/* ── History table ── */}
      <div className="card table-card">
        <div className="table-header">
          <div className="table-title-row">
            <h2 className="table-title">Recent Scans</h2>
            {pagination && (
              <span className="table-count">{pagination.total} total</span>
            )}
          </div>
          <div className="filter-tabs">
            {FILTERS.map((f) => (
              <button
                key={f}
                className={`filter-tab ${filter === f ? 'active' : ''}`}
                onClick={() => handleFilterChange(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {historyError && <ErrorBanner message={historyError} onRetry={loadHistory} />}

        {loadingHistory ? (
          <div className="table-loading">
            <span className="spinner-lg" aria-hidden="true" />
            <p>Loading scan history…</p>
          </div>
        ) : history.length === 0 ? (
          <div className="table-empty">
            <span>🔍</span>
            <p>No scans found{filter !== 'all' ? ` for "${filter}"` : ''}.</p>
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table className="threats-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Type</th>
                    <th>Input</th>
                    <th>Result</th>
                    <th>Risk Score</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((record, i) => {
                    const cfg = RESULT_CONFIG[record.result] || RESULT_CONFIG.safe;
                    return (
                      <tr key={record.id}>
                        <td className="td-num">{(page - 1) * 20 + i + 1}</td>
                        <td>
                          <span className={`type-badge type-${record.type}`}>
                            {record.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="td-input" title={record.inputData}>
                          {record.inputData}
                        </td>
                        <td>
                          <span className={`status-badge status-${cfg.cls}`}>
                            {cfg.icon} {cfg.label}
                          </span>
                        </td>
                        <td>
                          <div className="score-cell">
                            <div className="score-bar-track">
                              <div
                                className={`score-bar-fill score-${cfg.cls}`}
                                style={{ width: `${record.riskScore}%` }}
                              />
                            </div>
                            <span className="score-num">{record.riskScore}%</span>
                          </div>
                        </td>
                        <td className="td-date">
                          {new Date(record.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(record.id)}
                            disabled={deletingId === record.id}
                            aria-label="Delete record"
                            title="Delete"
                          >
                            {deletingId === record.id ? '…' : '🗑'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  ← Prev
                </button>
                <span className="page-info">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  className="page-btn"
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
