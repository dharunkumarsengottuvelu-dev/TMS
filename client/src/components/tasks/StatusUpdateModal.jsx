import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.jsx';
import { taskService } from '../../services/taskService.js';
import { StatusBadge } from '../common/StatusBadge.jsx';
import { AlertCircle } from 'lucide-react';

export function StatusUpdateModal({ isOpen, onClose, task, onStatusUpdated }) {
  const [selectedStatus, setSelectedStatus] = useState('NOT_STARTED');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (task) {
      setSelectedStatus(task.status || 'NOT_STARTED');
      setErrorMessage('');
    }
  }, [task, isOpen]);

  if (!task) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedStatus === task.status) {
      onClose();
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');
      await taskService.updateTaskStatus(task._id, selectedStatus);
      onStatusUpdated();
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update task status.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Task Progress Status"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Updating...' : 'Save & Notify Manager'}
          </button>
        </>
      }
    >
      {errorMessage && (
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: 'var(--color-danger-bg)',
            border: '1px solid var(--color-danger-border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-danger)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: 'var(--space-4)',
          }}
          role="alert"
        >
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            Target Task:
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {task.title}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--space-5)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Current Status:</span>
          <StatusBadge status={task.status} />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="new-status-select">
            New Status Designation <span className="required-star">*</span>
          </label>
          <select
            id="new-status-select"
            className="form-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            required
          >
            <option value="NOT_STARTED">Not Started</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div
          style={{
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            backgroundColor: 'var(--bg-subtle)',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          📧 <strong>Status Alert:</strong> Saving this change updates the central MongoDB records and sends a notification email to the administrator.
        </div>
      </form>
    </Modal>
  );
}
