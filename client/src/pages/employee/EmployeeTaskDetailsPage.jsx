import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { taskService } from '../../services/taskService.js';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { PriorityBadge } from '../../components/common/PriorityBadge.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { StatusUpdateModal } from '../../components/tasks/StatusUpdateModal.jsx';
import { Toast } from '../../components/common/Toast.jsx';
import { ArrowLeft, Edit3, Calendar, ShieldCheck } from 'lucide-react';

export function EmployeeTaskDetailsPage() {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchTaskDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await taskService.getTaskById(id);
      setTask(data);
    } catch (err) {
      setError(err.message || 'Access denied or task not found.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTaskDetails();
  }, [fetchTaskDetails]);

  const handleStatusUpdated = () => {
    setToastMessage('Task status updated! Management has been notified.');
    fetchTaskDetails();
  };

  if (loading) {
    return <LoadingSpinner message="Retrieving task record..." />;
  }

  if (error || !task) {
    return (
      <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
        <h3>Task Inaccessible</h3>
        <p style={{ marginTop: 8 }}>{error || 'This task does not belong to your account or does not exist.'}</p>
        <Link to="/employee/tasks" className="btn btn-secondary btn-sm" style={{ marginTop: 16 }}>
          <ArrowLeft size={14} />
          <span>Return to My Tasks</span>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Toast
        type="success"
        message={toastMessage}
        onDismiss={() => setToastMessage('')}
      />

      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
        <Link to="/employee/tasks" className="btn btn-secondary btn-sm">
          <ArrowLeft size={14} />
          <span>Back to My Tasks</span>
        </Link>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => setIsUpdateModalOpen(true)}
        >
          <Edit3 size={15} />
          <span>Update Progress Status</span>
        </button>
      </div>

      {/* Task Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)' }}>
        {/* Scope & Description */}
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
              Detailed Scope & Deliverables
            </h4>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              {task.description}
            </p>
          </div>
        </div>

        {/* Assignment & Management Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="card" style={{ padding: 'var(--space-5)' }}>
            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>
              Assignment Context
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
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Assignment Date</div>
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
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Last Status Update</div>
                  <div style={{ fontWeight: 500 }}>
                    {new Date(task.updatedAt).toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-subtle)' }}>
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={() => setIsUpdateModalOpen(true)}
              >
                <Edit3 size={15} />
                <span>Change Status</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      <StatusUpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        task={task}
        onStatusUpdated={handleStatusUpdated}
      />
    </div>
  );
}
