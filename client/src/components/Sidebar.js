import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const links = [
  { to: '/', icon: '🏠', label: 'Home' },
  { to: '/scan-url', icon: '🔗', label: 'URL Scanner' },
  { to: '/check-message', icon: '📧', label: 'Email / SMS Checker' },
  { to: '/dashboard', icon: '📊', label: 'Threat Dashboard' },
  { to: '/about', icon: 'ℹ️', label: 'About' },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle sidebar">
          <span /><span /><span />
        </button>
        <span className="mobile-brand">🛡️ PhishGuard <span className="brand-ai">AI</span></span>
      </div>

      {/* Overlay for mobile */}
      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <span className="brand-icon">🛡️</span>
          {!collapsed && <span className="brand-text">PhishGuard <span className="brand-ai">AI</span></span>}
        </div>

        {/* Collapse toggle (desktop only) */}
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)} aria-label="Collapse sidebar">
          {collapsed ? '»' : '«'}
        </button>

        <nav className="sidebar-nav">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`sidebar-link ${pathname === l.to ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? l.label : ''}
            >
              <span className="link-icon">{l.icon}</span>
              {!collapsed && <span className="link-label">{l.label}</span>}
              {pathname === l.to && !collapsed && <span className="active-dot" />}
            </Link>
          ))}
        </nav>

        {!collapsed && (
          <div className="sidebar-footer">
            <span className="sidebar-version">v1.0.0</span>
          </div>
        )}
      </aside>
    </>
  );
}
