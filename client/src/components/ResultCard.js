import React from 'react';
import './ResultCard.css';

/**
 * Reusable result card for URL / message scan results.
 * status: 'safe' | 'suspicious' | 'phishing'
 */
export default function ResultCard({ status, confidence, input, reasons = [] }) {
  const map = {
    safe:       { icon: '✅', label: 'Safe',              cls: 'safe' },
    suspicious: { icon: '⚠️', label: 'Suspicious',        cls: 'suspicious' },
    phishing:   { icon: '🚨', label: 'Phishing Detected', cls: 'danger' },
  };
  const { icon, label, cls } = map[status] || map.safe;

  return (
    <div className={`result-card rc-${cls}`}>
      <div className="rc-header">
        <span className="rc-icon">{icon}</span>
        <div>
          <p className="rc-verdict">{label}</p>
          {input && <p className="rc-input">{input}</p>}
        </div>
        <div className="rc-score-wrap">
          <span className="rc-score-label">Risk Score</span>
          <span className={`rc-score rc-score-${cls}`}>{confidence}%</span>
        </div>
      </div>

      {/* Risk meter bar */}
      <div className="rc-meter-track">
        <div
          className={`rc-meter-fill rc-meter-${cls}`}
          style={{ width: `${confidence}%` }}
        />
      </div>

      {reasons.length > 0 && (
        <ul className="rc-reasons">
          {reasons.map((r, i) => (
            <li key={i}>
              <span className="rc-reason-dot" />
              {r}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
