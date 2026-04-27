import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span>🛡️</span>
          <span>PhishGuard <span className="footer-ai">AI</span></span>
        </div>
        <nav className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/scan-url">URL Scanner</Link>
          <Link to="/check-message">Email/SMS</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/about">About</Link>
        </nav>
        <span className="footer-copy">© {new Date().getFullYear()} PhishGuard AI — MIT License</span>
      </div>
    </footer>
  );
}
