import React from 'react';

export function LoadingSpinner({ message = 'Loading data...' }) {
  return (
    <div className="loading-container">
      <div className="spinner" />
      {message && <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{message}</p>}
    </div>
  );
}
