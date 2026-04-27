import React from 'react';
import './About.css';

const techStack = [
  { icon: '⚛️',  name: 'React.js',    role: 'Frontend UI',          color: '#61dafb' },
  { icon: '🟢',  name: 'Node.js',     role: 'Backend Runtime',       color: '#68a063' },
  { icon: '🚂',  name: 'Express.js',  role: 'REST API Server',       color: '#ffffff' },
  { icon: '🍃',  name: 'MongoDB',     role: 'Database',              color: '#47a248' },
  { icon: '🎨',  name: 'CSS3',        role: 'Styling & Animations',  color: '#264de4' },
  { icon: '🤖',  name: 'AI Engine',   role: 'Phishing Detection',    color: '#00d4ff' },
];

const team = [
  { name: 'Security Research Team', role: 'Threat Intelligence & Detection Models', avatar: '🔬' },
  { name: 'Frontend Engineers',     role: 'UI/UX Design & React Development',       avatar: '🎨' },
  { name: 'Backend Engineers',      role: 'API Design & Database Architecture',     avatar: '⚙️' },
  { name: 'ML Engineers',           role: 'AI Model Training & Optimization',       avatar: '🤖' },
];

const objectives = [
  { icon: '🎯', title: 'Real-Time Detection',   desc: 'Analyze threats in under a second using AI-powered heuristics and pattern matching.' },
  { icon: '🔍', title: 'Multi-Vector Coverage', desc: 'Detect phishing across URLs, emails, and SMS — the three most common attack vectors.' },
  { icon: '📊', title: 'Explainable Results',   desc: 'Every verdict comes with a risk score and clear reasons, not just a yes/no answer.' },
  { icon: '🛡️', title: 'Always Improving',      desc: 'Continuously updated threat database and model retraining to stay ahead of attackers.' },
];

export default function About() {
  return (
    <div className="about-page">
      <div className="page-header">
        <h1 className="page-title">About PhishGuard AI</h1>
        <p className="page-subtitle">
          An open-source AI-powered phishing detection system built for modern cybersecurity.
        </p>
      </div>

      {/* Mission banner */}
      <div className="mission-banner card">
        <div className="mission-glow" />
        <span className="mission-icon">🛡️</span>
        <div>
          <h2 className="mission-title">Our Mission</h2>
          <p className="mission-text">
            To make phishing detection fast, transparent, and accessible to everyone — from individual users
            to enterprise security teams — by combining AI with explainable threat intelligence.
          </p>
        </div>
      </div>

      {/* Objectives */}
      <section className="about-section">
        <h2 className="about-section-title">Project Objectives</h2>
        <div className="objectives-grid">
          {objectives.map((o) => (
            <div key={o.title} className="card objective-card">
              <span className="obj-icon">{o.icon}</span>
              <h3 className="obj-title">{o.title}</h3>
              <p className="obj-desc">{o.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech stack */}
      <section className="about-section">
        <h2 className="about-section-title">Technologies Used</h2>
        <div className="tech-grid">
          {techStack.map((t) => (
            <div key={t.name} className="card tech-card">
              <span className="tech-icon">{t.icon}</span>
              <span className="tech-name" style={{ color: t.color }}>{t.name}</span>
              <span className="tech-role">{t.role}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="about-section">
        <h2 className="about-section-title">Team & Organization</h2>
        <div className="team-grid">
          {team.map((m) => (
            <div key={m.name} className="card team-card">
              <span className="team-avatar">{m.avatar}</span>
              <div>
                <p className="team-name">{m.name}</p>
                <p className="team-role">{m.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Version info */}
      <div className="version-strip card">
        <span>📦 Version 1.0.0</span>
        <span>🔒 MIT License</span>
        <span>🌐 Open Source</span>
        <span>📅 2024</span>
      </div>
    </div>
  );
}
