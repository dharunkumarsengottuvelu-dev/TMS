import React from 'react';
import { Inbox } from 'lucide-react';

export function EmptyState({
  title = 'No records found',
  description = 'There are no items to display matching your current filter criteria.',
  icon: Icon = Inbox,
  action = null,
}) {
  const renderAction = () => {
    if (!action) return null;
    if (React.isValidElement(action)) {
      return action;
    }
    if (typeof action === 'object' && action.label && typeof action.onClick === 'function') {
      return (
        <button type="button" className="btn btn-primary btn-sm" onClick={action.onClick}>
          {action.label}
        </button>
      );
    }
    return null;
  };

  const actionElement = renderAction();

  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={26} strokeWidth={1.75} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {actionElement && <div style={{ marginTop: '16px' }}>{actionElement}</div>}
    </div>
  );
}
