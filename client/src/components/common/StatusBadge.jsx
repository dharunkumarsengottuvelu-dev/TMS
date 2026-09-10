import React from 'react';

const STATUS_LABELS = {
  NOT_STARTED: 'Not Started',
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};

const STATUS_CLASSES = {
  NOT_STARTED: 'badge-status-not-started',
  PENDING: 'badge-status-pending',
  IN_PROGRESS: 'badge-status-in-progress',
  COMPLETED: 'badge-status-completed',
};

export function StatusBadge({ status }) {
  const label = STATUS_LABELS[status] || status;
  const className = STATUS_CLASSES[status] || 'badge-status-not-started';

  return (
    <span className={`badge ${className}`}>
      <span className="badge-dot" />
      {label}
    </span>
  );
}
