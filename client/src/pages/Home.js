import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const features = [
  {
    icon: '🔗',
    title: 'URL Scanner',
    desc: 'Instantly analyze any link for phishing indicators, suspicious redirects, and malicious domains.',
    to: '/scan-url',
    tag: 'Real-time',
  },
  {
    icon: '📧',
    title: 'Email / SMS Checker',
    desc: 'Detect social engineering tactics, urgency cues, and credential-harvesting patterns in messages.',
    to: '/check-message',
    tag: 'AI-Powered',
  },
  {
    icon: '📊',
    title: 'Threat Dashboard',
    desc: 'Track all scanned threats, view risk trends, and monitor your security posture over time.',
    to: '/dashboard',
    tag: 'Analytics',
  },
  {
    icon: '🛡️',
    title: 'Risk Scoring',
    desc: 'Every scan returns a 0–100 risk score with detailed reasons so you know exactly why a threat was flagged.',
    to: '/scan-url',
    tag: 'Explainable',
  },
];

const stats = [
  { value: '99.2%', label: 'Detection Accuracy' },
  { value: '<1s',   label: 'Average Scan Time' },
  { value: '3',     label: 'Threat Vectors Covered' },
  { value: '24/7',  label: 'Always On Protection' },
];

const howItWorks = [
  { step: '01', title: 'Submit Input', desc: 'Paste a URL, email body, or SMS text into the scanner.' },
  { step: '02', title: 'AI Analysis',  desc: 'Our engine checks patterns, domains, keywords, and heuristics.' },
  { step: '03', title: 'Get Results',  desc: 'Receive a verdict, risk score, and detailed explanation instantly.' },
];

export default function Home() {
  return (
    <div className="home">

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          AI-Powered Phishing Detection
        </div>
        <h1 className="hero-title">
          Stop Phishing Attacks<br />
          <span className="highlight">Before They Strike</span>
        </h1>
        <p className="hero-sub">
          PhishGuard AI scans URLs, emails, and SMS messages in real time — giving you a risk score,
          threat verdict, and clear explanation in under a second.
        </p>
        <div className="hero-actions">
          <Link to="/scan-url" className="btn btn-primary hero-btn">
            🔍 Scan a URL
          </Link>
          <Link to="/check-message" className="btn btn-outline hero-btn">
            📧 Check a Message
          </Link>
          <Link to="/dashboard" className="btn btn-ghost hero-btn">
            📊 View Dashboard
          </Link>
        </div>
        <div className="hero-stats">
          {stats.map((s) => (
            <div key={s.label} className="hero-stat">
              <span className="hero-stat-val">{s.value}</span>
              <span className="hero-stat-lbl">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="section">
        <div className="section-header">
          <span className="section-tag">Features</span>
          <h2 className="section-title">Everything You Need to Stay Safe</h2>
          <p className="section-sub">Three powerful tools, one unified dashboard.</p>
        </div>
        <div className="features-grid">
          {features.map((f) => (
            <Link to={f.to} key={f.title} className="feature-card card">
              <div className="fc-top">
                <span className="fc-icon">{f.icon}</span>
                <span className="fc-tag">{f.tag}</span>
              </div>
              <h3 className="fc-title">{f.title}</h3>
              <p className="fc-desc">{f.desc}</p>
              <span className="fc-arrow">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="section">
        <div className="section-header">
          <span className="section-tag">How It Works</span>
          <h2 className="section-title">Three Steps to Threat Detection</h2>
        </div>
        <div className="steps-row">
          {howItWorks.map((h, i) => (
            <div key={h.step} className="step-card card">
              <span className="step-num">{h.step}</span>
              <h3 className="step-title">{h.title}</h3>
              <p className="step-desc">{h.desc}</p>
              {i < howItWorks.length - 1 && <span className="step-arrow">→</span>}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section card">
        <div className="cta-glow" />
        <h2 className="cta-title">Ready to Detect Threats?</h2>
        <p className="cta-sub">Start scanning for free — no account required.</p>
        <div className="hero-actions">
          <Link to="/scan-url" className="btn btn-primary">🔍 Start Scanning</Link>
          <Link to="/about" className="btn btn-outline">Learn More</Link>
        </div>
      </section>

    </div>
  );
}
