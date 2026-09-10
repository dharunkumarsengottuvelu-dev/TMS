import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export function Toast({ type = 'success', message, onDismiss }) {
  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div className={`toast-banner ${isSuccess ? 'toast-success' : 'toast-error'}`} role="status">
      {isSuccess ? (
        <CheckCircle2 size={18} color="var(--color-success)" />
      ) : (
        <AlertCircle size={18} color="var(--color-danger)" />
      )}
      <span style={{ fontWeight: 500 }}>{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 2,
            marginLeft: 8,
            color: 'var(--text-muted)',
            display: 'flex',
          }}
          aria-label="Dismiss notification"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
