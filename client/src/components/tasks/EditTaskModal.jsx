import React, { useState, useEffect, useCallback } from 'react';
import { taskService } from '../../services/taskService.js';
import { employeeService } from '../../services/employeeService.js';
import { X, CheckCircle2, AlertCircle, Loader2, Edit3, User, Calendar, Flag, Activity } from 'lucide-react';

export function EditTaskModal({ task, isOpen, onClose, onTaskUpdated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [status, setStatus] = useState('NOT_STARTED');
  const [assignedEmployee, setAssignedEmployee] = useState('');
  const [dueDate, setDueDate] = useState('');

  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Pre-fill form when task changes or modal opens
  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPriority(task.priority || 'MEDIUM');
      setStatus(task.status || 'NOT_STARTED');
      const empId = typeof task.assignedEmployee === 'object' ? task.assignedEmployee?._id : task.assignedEmployee;
      setAssignedEmployee(empId || '');
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
      setErrorMessage('');
    }
  }, [task, isOpen]);

  // Load active employees for assignment dropdown
  const loadEmployees = useCallback(async () => {
    try {
      setLoadingEmployees(true);
      const res = await employeeService.getEmployees({ limit: 100, status: 'ACTIVE', role: 'EMPLOYEE' });
      if (res.data) {
        setEmployees(res.data);
      }
    } catch (_) {
      // Fallback
    } finally {
      setLoadingEmployees(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadEmployees();
    }
  }, [isOpen, loadEmployees]);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim() || title.trim().length < 3) {
      setErrorMessage('Task title must be at least 3 characters.');
      return;
    }

    if (!description.trim()) {
      setErrorMessage('Task description cannot be empty.');
      return;
    }

    if (!assignedEmployee) {
      setErrorMessage('Please assign this task to an employee.');
      return;
    }

    try {
      setSubmitting(true);
      const updates = {
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        assignedEmployee,
        dueDate: dueDate || null,
      };

      await taskService.updateTask(task._id, updates);
      onTaskUpdated();
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to update task specifications.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container" style={{ maxWidth: 620, backgroundColor: '#ffffff', color: '#0f172a' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #4f46e5, #4338ca)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Edit3 size={18} color="#fff" />
            </div>
            <div>
              <h2 className="modal-title">Edit Task Specifications</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Update title, assignee, priority, status or deadline
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errorMessage && (
              <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="edit-task-title">
                Task Title <span className="form-required">*</span>
              </label>
              <input
                id="edit-task-title"
                type="text"
                className="form-control"
                placeholder="Enter task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="edit-task-desc">
                Description <span className="form-required">*</span>
              </label>
              <textarea
                id="edit-task-desc"
                className="form-control form-textarea"
                rows={4}
                placeholder="Provide detailed task requirements and acceptance criteria"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Row 1: Assignee & Priority */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label" htmlFor="edit-task-assignee">
                  <User size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                  Assigned Employee <span className="form-required">*</span>
                </label>
                <select
                  id="edit-task-assignee"
                  className="form-select"
                  value={assignedEmployee}
                  onChange={(e) => setAssignedEmployee(e.target.value)}
                  disabled={loadingEmployees}
                  required
                >
                  <option value="" disabled>
                    {loadingEmployees ? 'Loading staff…' : 'Select active employee'}
                  </option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} {emp.employeeId ? `(${emp.employeeId})` : `(${emp.email})`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-task-priority">
                  <Flag size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                  Priority <span className="form-required">*</span>
                </label>
                <select
                  id="edit-task-priority"
                  className="form-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="HIGH">High Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="LOW">Low Priority</option>
                </select>
              </div>
            </div>

            {/* Row 2: Status & Due Date */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label" htmlFor="edit-task-status">
                  <Activity size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                  Status
                </label>
                <select
                  id="edit-task-status"
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="NOT_STARTED">Not Started</option>
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-task-due-date">
                  <Calendar size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                  Due Date
                </label>
                <input
                  id="edit-task-due-date"
                  type="date"
                  className="form-control"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 size={15} className="spinner-icon" />
                  <span>Saving…</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
