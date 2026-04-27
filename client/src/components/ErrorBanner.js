import React from 'react';
import './ErrorBanner.css';

export default function ErrorBanner({ message, onRetry }) {
  return (
    <div className="error-banner" role="alert">
      <span className="error-banner-icon">⚠️</span>
      <span className="error-banner-msg">{message}</span>
      {onRetry && (
        <button className="error-banner-retry" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
