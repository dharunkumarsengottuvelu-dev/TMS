import React from 'react';
import { Inbox } from 'lucide-react';

export function EmptyState({
  title = 'No records found',
  description = 'There are no items to display matching your current filter criteria.',
  icon: Icon = Inbox,
  action = null,
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={26} strokeWidth={1.75} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && <div style={{ marginTop: '16px' }}>{action}</div>}
    </div>
  );
}
