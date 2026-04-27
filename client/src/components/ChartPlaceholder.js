import React from 'react';
import './ChartPlaceholder.css';

/**
 * Dynamic chart component with real data support.
 * type:  'bar' | 'donut' | 'line'
 * data:  Array of data points or object with counts
 */
export default function ChartPlaceholder({ title, type = 'bar', height = 180, data = null }) {
  return (
    <div className="chart-ph card">
      <div className="chart-ph-header">
        <span className="chart-ph-title">{title}</span>
        <span className="chart-ph-badge">{data ? 'Live' : 'Demo'}</span>
      </div>
      <div className="chart-ph-body" style={{ height }}>
        {type === 'bar' && <BarChart data={data} />}
        {type === 'donut' && <DonutChart data={data} />}
        {type === 'line' && <LineChart data={data} />}
      </div>
      {!data && <p className="chart-ph-note">Waiting for data...</p>}
    </div>
  );
}

function BarChart({ data }) {
  // data: array of { _id: date, count: num }
  const bars = data && data.length > 0
    ? data.map(d => ({ label: d._id?.slice(-5), value: d.count || 0 }))
    : [40, 65, 30, 80, 55, 70, 45].map((v, i) => ({ label: `Day ${i+1}`, value: v }));

  const maxValue = Math.max(...bars.map(b => b.value), 100);
  const normalized = bars.map(b => (b.value / maxValue) * 100);

  return (
    <div className="chart-bar">
      {normalized.map((h, i) => (
        <div key={i} className="bar-col" title={`${bars[i].label}: ${bars[i].value}`}>
          <div className="bar-fill" style={{ height: `${h}%`, animationDelay: `${i * 0.06}s` }} />
          <span className="bar-label">{bars[i].label}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ data }) {
  // data: { url: num, email: num, sms: num }
  const values = data 
    ? { phishing: data.phishing || 0, safe: data.safe || 0, suspicious: data.suspicious || 0 }
    : { phishing: 43, safe: 120, suspicious: 37 };

  const total = Object.values(values).reduce((a, b) => a + b, 0) || 1;
  const phishingPct = (values.phishing / total) * 100;
  const safePct = (values.safe / total) * 100;
  const suspiciousPct = (values.suspicious / total) * 100;

  const circumference = 2 * Math.PI * 38;
  const phishingDash = (phishingPct / 100) * circumference;
  const safeDash = (safePct / 100) * circumference;
  const suspiciousDash = (suspiciousPct / 100) * circumference;

  let phishingOffset = 0;
  let safeOffset = -phishingDash;
  let suspiciousOffset = -(phishingDash + safeDash);

  return (
    <div className="chart-donut">
      <svg viewBox="0 0 100 100" className="donut-svg">
        <circle cx="50" cy="50" r="38" fill="none" stroke="var(--border)" strokeWidth="14" />
        <circle cx="50" cy="50" r="38" fill="none" stroke="var(--accent-red)"
          strokeWidth="14" strokeDasharray={`${phishingDash} ${circumference}`}
          strokeDashoffset={phishingOffset} strokeLinecap="round"
          title={`Phishing: ${values.phishing} (${phishingPct.toFixed(0)}%)`} />
        <circle cx="50" cy="50" r="38" fill="none" stroke="var(--accent-green)"
          strokeWidth="14" strokeDasharray={`${safeDash} ${circumference}`}
          strokeDashoffset={safeOffset} strokeLinecap="round"
          title={`Safe: ${values.safe} (${safePct.toFixed(0)}%)`} />
        <circle cx="50" cy="50" r="38" fill="none" stroke="var(--accent-yellow)"
          strokeWidth="14" strokeDasharray={`${suspiciousDash} ${circumference}`}
          strokeDashoffset={suspiciousOffset} strokeLinecap="round"
          title={`Suspicious: ${values.suspicious} (${suspiciousPct.toFixed(0)}%)`} />
      </svg>
      <div className="donut-center">{total}</div>
      <div className="donut-legend">
        <div><span className="dot red"></span> Phishing: {values.phishing}</div>
        <div><span className="dot green"></span> Safe: {values.safe}</div>
        <div><span className="dot yellow"></span> Suspicious: {values.suspicious}</div>
      </div>
    </div>
  );
}

function LineChart({ data }) {
  // data: array of { _id: date, avgRiskScore: num } or similar
  const points = data && data.length > 0
    ? data.map((d, i) => {
        const value = d.avgRiskScore !== undefined ? d.avgRiskScore : d.count || 0;
        return { x: i, y: Math.round(value * 10) / 10, label: d._id?.slice(-5) };
      })
    : [
        { x: 0, y: 45, label: 'Day 1' },
        { x: 1, y: 62, label: 'Day 2' },
        { x: 2, y: 38, label: 'Day 3' },
        { x: 3, y: 71, label: 'Day 4' },
        { x: 4, y: 55, label: 'Day 5' },
        { x: 5, y: 68, label: 'Day 6' },
        { x: 6, y: 42, label: 'Day 7' },
      ];

  const maxValue = Math.max(...points.map(p => p.y), 100);
  const width = 280;
  const height = 120;
  const padding = 20;
  const graphWidth = width - 2 * padding;
  const graphHeight = height - 2 * padding;
  const xStep = graphWidth / (points.length - 1 || 1);

  const pathD = points
    .map((p, i) => {
      const x = padding + i * xStep;
      const y = height - padding - (p.y / maxValue) * graphHeight;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <div className="chart-line">
      <svg viewBox={`0 0 ${width} ${height}`} className="line-svg">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const y = height - padding - pct * graphHeight;
          return <line key={i} x1={padding} y1={y} x2={width - padding} y2={y} stroke="var(--border)" strokeWidth="0.5" opacity="0.5" />;
        })}
        {/* Line */}
        <path d={pathD} stroke="var(--accent-blue)" strokeWidth="2" fill="none" vectorEffect="non-scaling-stroke" />
        {/* Points */}
        {points.map((p, i) => {
          const x = padding + i * xStep;
          const y = height - padding - (p.y / maxValue) * graphHeight;
          return <circle key={i} cx={x} cy={y} r="3" fill="var(--accent-blue)" title={`${p.label}: ${p.y}`} />;
        })}
      </svg>
      <div className="line-labels">
        {points.map((p, i) => (
          <div key={i} className="line-label">{p.label}</div>
        ))}
      </div>
    </div>
  );
}
