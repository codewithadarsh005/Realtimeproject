import React, { useState } from 'react';
import ResultCard from '../components/ResultCard';
import ErrorBanner from '../components/ErrorBanner';
import useApi from '../hooks/useApi';
import { scanMessage as scanMessageApi } from '../api/scanApi';
import './MessageChecker.css';

const PHISHING_KEYWORDS = [
  'verify your account', 'click here', 'urgent', 'password reset',
  'suspended', 'confirm your', 'act now', 'limited time', 'bank account',
  'social security', 'won a prize', 'claim your',
];

const SAMPLES = {
  email: `Dear Customer,

Your account has been suspended due to suspicious activity. 
Please click here to verify your account immediately or it will be permanently deleted.

Urgent: Act now to restore access.

Support Team`,
  sms: `ALERT: Your bank account has been locked. Confirm your details at http://secure-bank-verify.xyz to restore access. Act now!`,
};

const CHAR_LIMIT = 2000;

export default function MessageChecker() {
  const [message, setMessage] = useState('');
  const [type, setType]       = useState('email');
  const { data: result, loading, error, execute, reset } = useApi(scanMessageApi);

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    await execute(message.trim(), type);
  };

  const handleTypeSwitch = (t) => {
    setType(t);
    setMessage('');
    reset();
  };

  return (
    <div className="msg-checker-page">
      <div className="page-header">
        <h1 className="page-title">Email / SMS Checker</h1>
        <p className="page-subtitle">
          Paste the content of a suspicious email or SMS to detect phishing patterns and social engineering tactics.
        </p>
      </div>

      <div className="checker-layout">
        <div className="checker-main">
          <div className="card checker-card">

            {/* Type toggle */}
            <div className="type-toggle">
              {['email', 'sms'].map((t) => (
                <button
                  key={t}
                  className={`type-btn ${type === t ? 'active' : ''}`}
                  onClick={() => handleTypeSwitch(t)}
                >
                  {t === 'email' ? '📧 Email' : '💬 SMS'}
                </button>
              ))}
            </div>

            <form onSubmit={handleCheck}>
              <div className="textarea-wrap">
                <textarea
                  rows={8}
                  placeholder={`Paste your ${type} content here…`}
                  value={message}
                  onChange={(e) => { setMessage(e.target.value.slice(0, CHAR_LIMIT)); reset(); }}
                  className="msg-textarea"
                  aria-label={`${type} content`}
                />
                <span className="char-count">{message.length} / {CHAR_LIMIT}</span>
              </div>

              <div className="checker-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || !message.trim()}
                >
                  {loading
                    ? <><span className="spinner" aria-hidden="true" /> Analyzing…</>
                    : '🔍 Analyze Message'}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => { setMessage(SAMPLES[type]); reset(); }}
                >
                  Load Sample
                </button>
                {message && (
                  <button type="button" className="btn btn-ghost" onClick={() => { setMessage(''); reset(); }}>
                    Clear
                  </button>
                )}
              </div>
            </form>

            {/* Error state */}
            {error && <ErrorBanner message={error} onRetry={() => execute(message.trim(), type)} />}

            {/* Result — uses backend field names */}
            {result && (
              <ResultCard
                status={result.prediction}
                confidence={result.riskScore}
                reasons={result.reasons}
              />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="checker-info">
          <div className="card info-card">
            <h3 className="info-title">🧠 What We Detect</h3>
            <ul className="info-list">
              <li><span className="info-dot red" />Urgency / fear tactics</li>
              <li><span className="info-dot red" />Credential harvesting</li>
              <li><span className="info-dot red" />Suspicious links</li>
              <li><span className="info-dot red" />Impersonation patterns</li>
              <li><span className="info-dot red" />Prize / reward scams</li>
            </ul>
          </div>
          <div className="card info-card keyword-card">
            <h3 className="info-title">🚩 Common Red Flags</h3>
            <div className="keyword-chips">
              {PHISHING_KEYWORDS.slice(0, 8).map((kw) => (
                <span key={kw} className="kw-chip">{kw}</span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
