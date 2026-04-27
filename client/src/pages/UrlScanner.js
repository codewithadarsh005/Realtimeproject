import React, { useState } from 'react';
import ResultCard from '../components/ResultCard';
import ErrorBanner from '../components/ErrorBanner';
import useApi from '../hooks/useApi';
import { scanUrl as scanUrlApi } from '../api/scanApi';
import './UrlScanner.css';

const EXAMPLE_URLS = [
  'https://paypal-secure-login.xyz/verify',
  'https://google.com',
  'http://amazon-account-suspended.net/login',
];

export default function UrlScanner() {
  const [url, setUrl] = useState('');
  const { data: result, loading, error, execute, reset: resetApi } = useApi(scanUrlApi);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    await execute(url.trim());
  };

  const handleClear = () => {
    setUrl('');
    resetApi();
  };

  const handleExample = (u) => {
    setUrl(u);
    resetApi();
  };

  return (
    <div className="url-scanner-page">
      <div className="page-header">
        <h1 className="page-title">URL Scanner</h1>
        <p className="page-subtitle">
          Paste any link below to check for phishing indicators, malicious redirects, and suspicious domains.
        </p>
      </div>

      <div className="scanner-layout">
        <div className="scan-main">
          <div className="card scan-card">
            <form onSubmit={handleScan} className="scan-form">
              <div className="url-input-wrap">
                <span className="url-icon">🔗</span>
                <input
                  type="text"
                  placeholder="https://example.com/login"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); reset(); }}
                  className="url-input"
                  spellCheck={false}
                  aria-label="URL to scan"
                />
                {url && (
                  <button type="button" className="url-clear" onClick={handleClear} aria-label="Clear">
                    ✕
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="btn btn-primary scan-btn"
                disabled={loading || !url.trim()}
              >
                {loading ? <><span className="spinner" aria-hidden="true" /> Scanning…</> : '🔍 Scan URL'}
              </button>
            </form>

            {/* Error state */}
            {error && <ErrorBanner message={error} onRetry={() => execute(url.trim())} />}

            {/* Result card — uses backend field names */}
            {result && (
              <ResultCard
                status={result.prediction}
                confidence={result.riskScore}
                input={result.inputData || result.data?.inputData}
                reasons={result.reasons}
              />
            )}
          </div>

          {/* Example chips */}
          <div className="examples-row">
            <span className="examples-label">Try an example:</span>
            {EXAMPLE_URLS.map((u) => (
              <button key={u} className="example-chip" onClick={() => handleExample(u)}>
                {u.length > 40 ? u.slice(0, 40) + '…' : u}
              </button>
            ))}
          </div>
        </div>

        {/* Info sidebar */}
        <aside className="scan-info">
          <div className="card info-card">
            <h3 className="info-title">🔎 What We Check</h3>
            <ul className="info-list">
              <li><span className="info-dot cyan" />HTTPS / SSL certificate</li>
              <li><span className="info-dot cyan" />Domain age &amp; reputation</li>
              <li><span className="info-dot cyan" />Suspicious keywords in URL</li>
              <li><span className="info-dot cyan" />IP-based URLs</li>
              <li><span className="info-dot cyan" />Excessive subdomains</li>
              <li><span className="info-dot cyan" />Redirect chains</li>
            </ul>
          </div>
          <div className="card info-card">
            <h3 className="info-title">📊 Risk Levels</h3>
            <div className="risk-levels">
              <div className="risk-row"><span className="badge badge-success">Safe</span><span>0 – 24%</span></div>
              <div className="risk-row"><span className="badge badge-warning">Suspicious</span><span>25 – 59%</span></div>
              <div className="risk-row"><span className="badge badge-danger">Phishing</span><span>60 – 100%</span></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
