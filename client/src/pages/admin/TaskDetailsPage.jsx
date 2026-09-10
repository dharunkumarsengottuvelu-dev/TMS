import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { taskService } from '../../services/taskService.js';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { PriorityBadge } from '../../components/common/PriorityBadge.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { ArrowLeft, Trash2, Calendar, User, ShieldCheck } from 'lucide-react';

export function TaskDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTaskDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await taskService.getTaskById(id);
      setTask(data);
    } catch (err) {
      setError(err.message || 'Failed to load task details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTaskDetails();
  }, [fetchTaskDetails]);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete "${task.title}"?`)) {
      return;
    }

    try {
      setDeleting(true);
      await taskService.deleteTask(task._id);
      navigate('/admin/tasks', { replace: true });
    } catch (err) {
      alert(`Failed to delete task: ${err.message}`);
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Retrieving task record..." />;
  }

  if (error || !task) {
    return (
      <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
        <h3>Error Retrieving Task</h3>
        <p style={{ marginTop: 8 }}>{error || 'Task not found.'}</p>
        <Link to="/admin/tasks" className="btn btn-secondary btn-sm" style={{ marginTop: 16 }}>
          <ArrowLeft size={14} />
          <span>Back to Task List</span>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Navigation & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
        <Link to="/admin/tasks" className="btn btn-secondary btn-sm">
          <ArrowLeft size={14} />
          <span>Back to All Tasks</span>
        </Link>

        <button
          type="button"
          className="btn btn-danger btn-sm"
          onClick={handleDelete}
          disabled={deleting}
        >
          <Trash2 size={14} />
          <span>{deleting ? 'Deleting...' : 'Delete Task'}</span>
        </button>
      </div>

      {/* Main Task Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)' }}>
        {/* Left Column: Scope & Description */}
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--space-3)' }}>
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
          </div>

          <h1 style={{ fontSize: '1.45rem', marginBottom: 'var(--space-4)', color: 'var(--text-primary)' }}>
            {task.title}
          </h1>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-4)' }}>
            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>
              Task Description & Specifications
            </h4>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              {task.description}
            </p>
          </div>
        </div>

        {/* Right Column: Metadata & Ownership */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Assigned Employee Card */}
          <div className="card" style={{ padding: 'var(--space-5)' }}>
            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>
              Assigned Employee
            </h4>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: '#e0e7ff',
                  color: 'var(--primary-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <User size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {task.assignedEmployee?.name || 'Unassigned'}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {task.assignedEmployee?.email}
                </div>
              </div>
            </div>

            {task.assignedEmployee?._id && (
              <div style={{ marginTop: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-subtle)' }}>
                <Link
                  to={`/admin/employees/${task.assignedEmployee._id}`}
                  style={{ fontSize: '0.85rem', fontWeight: 500 }}
                >
                  View Employee Workload Profile &rarr;
                </Link>
              </div>
            )}
          </div>

          {/* Assignment Metadata */}
          <div className="card" style={{ padding: 'var(--space-5)' }}>
            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>
              Task Metadata
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <ShieldCheck size={16} color="var(--text-muted)" style={{ marginTop: 2 }} />
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Assigned By</div>
                  <div style={{ fontWeight: 500 }}>{task.assignedBy?.name || 'Administrator'}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{task.assignedBy?.email}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Calendar size={16} color="var(--text-muted)" style={{ marginTop: 2 }} />
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Creation Date</div>
                  <div style={{ fontWeight: 500 }}>
                    {new Date(task.createdAt).toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Calendar size={16} color="var(--text-muted)" style={{ marginTop: 2 }} />
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Last Modified</div>
                  <div style={{ fontWeight: 500 }}>
                    {new Date(task.updatedAt).toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
