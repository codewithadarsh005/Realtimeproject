import React from 'react';
import './StatCard.css';

export default function StatCard({ icon, value, label, variant = 'default', trend }) {
  return (
    <div className={`stat-card-c card sc-${variant}`}>
      <div className="sc-top">
        <span className="sc-icon">{icon}</span>
        {trend !== undefined && (
          <span className={`sc-trend ${trend >= 0 ? 'up' : 'down'}`}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <span className="sc-value">{value}</span>
      <span className="sc-label">{label}</span>
    </div>
  );
}
