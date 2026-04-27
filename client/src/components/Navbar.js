import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const links = [
  { to: '/', label: 'Home' },
  { to: '/scan-url', label: 'URL Scanner' },
  { to: '/check-message', label: 'Email/SMS Checker' },
  { to: '/dashboard', label: 'Threat Dashboard' },
  { to: '/about', label: 'About' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <Link to="/" className="nav-brand">
          <span className="brand-icon">🛡️</span>
          <span>PhishGuard <span className="brand-ai">AI</span></span>
        </Link>

        <button className="nav-toggle" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          <span /><span /><span />
        </button>

        <ul className={`nav-links ${open ? 'open' : ''}`}>
          {links.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className={`nav-link ${pathname === l.to ? 'active' : ''}`}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
