import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '../common/Modal.jsx';
import { employeeService } from '../../services/employeeService.js';
import { taskService } from '../../services/taskService.js';
import { AlertCircle } from 'lucide-react';

export function CreateTaskModal({ isOpen, onClose, onTaskCreated }) {
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedEmployee, setAssignedEmployee] = useState('');
  const [priority, setPriority] = useState('MEDIUM');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadEmployees = useCallback(async () => {
    try {
      setLoadingEmployees(true);
      const res = await employeeService.getEmployees({ limit: 100 });
      if (res.data) {
        setEmployees(res.data);
        if (res.data.length > 0 && !assignedEmployee) {
          setAssignedEmployee(res.data[0]._id);
        }
      }
    } catch (_err) {
      setErrorMessage('Could not load employee directory.');
    } finally {
      setLoadingEmployees(false);
    }
  }, [assignedEmployee]);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      loadEmployees();
    }
  }, [isOpen, loadEmployees]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (title.trim().length < 3) {
      setErrorMessage('Title must be at least 3 characters.');
      return;
    }

    if (!description.trim()) {
      setErrorMessage('Description is required.');
      return;
    }

    if (!assignedEmployee) {
      setErrorMessage('Please select an employee to assign this task to.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');

      await taskService.createTask({
        title: title.trim(),
        description: description.trim(),
        assignedEmployee,
        priority,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');

      onTaskCreated();
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create task.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Enterprise Task"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Creating Task...' : 'Create & Assign Task'}
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
        <div className="form-group">
          <label className="form-label" htmlFor="task-title">
            Task Title <span className="required-star">*</span>
          </label>
          <input
            id="task-title"
            type="text"
            className="form-control"
            placeholder="e.g. Core Database Cluster Optimization"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={120}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="task-description">
            Task Description <span className="required-star">*</span>
          </label>
          <textarea
            id="task-description"
            className="form-control form-textarea"
            placeholder="Detailed scope of work, expected deliverables, and performance benchmarks..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            required
            maxLength={2000}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="task-assignee">
              Assigned Employee <span className="required-star">*</span>
            </label>
            <select
              id="task-assignee"
              className="form-select"
              value={assignedEmployee}
              onChange={(e) => setAssignedEmployee(e.target.value)}
              disabled={loadingEmployees}
              required
            >
              {loadingEmployees ? (
                <option value="">Loading employees...</option>
              ) : (
                employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.email})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-priority">
              Priority <span className="required-star">*</span>
            </label>
            <select
              id="task-priority"
              className="form-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              required
            >
              <option value="HIGH">HIGH Priority</option>
              <option value="MEDIUM">MEDIUM Priority</option>
              <option value="LOW">LOW Priority</option>
            </select>
          </div>
        </div>

        <div
          style={{
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            marginTop: '8px',
            backgroundColor: 'var(--bg-subtle)',
            padding: '8px 12px',
            borderRadius: 'var(--radius-xs)',
          }}
        >
          ℹ️ An automated email notification with task specifications will be dispatched to the selected employee upon creation.
        </div>
      </form>
    </Modal>
  );
}
