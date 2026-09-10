import React from 'react';

const PRIORITY_CLASSES = {
  HIGH: 'badge-priority-high',
  MEDIUM: 'badge-priority-medium',
  LOW: 'badge-priority-low',
};

export function PriorityBadge({ priority }) {
  const className = PRIORITY_CLASSES[priority] || 'badge-priority-medium';

  return (
    <span className={`badge ${className}`}>
      {priority}
    </span>
  );
}
