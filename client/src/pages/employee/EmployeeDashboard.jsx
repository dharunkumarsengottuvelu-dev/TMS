import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService.js';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { PriorityBadge } from '../../components/common/PriorityBadge.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { StatusUpdateModal } from '../../components/tasks/StatusUpdateModal.jsx';
import { Toast } from '../../components/common/Toast.jsx';
import { CheckSquare, Clock, CheckCircle2, ArrowUpRight, Edit3, AlertCircle } from 'lucide-react';

export function EmployeeDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status update modal state
  const [selectedTaskForUpdate, setSelectedTaskForUpdate] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardService.getEmployeeDashboard();
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load employee metrics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleStatusUpdated = () => {
    setToastMessage('Task status updated! Management has been notified via email.');
    fetchDashboard();
  };

  if (loading) {
    return <LoadingSpinner message="Loading your assigned workload..." />;
  }

  if (error) {
    return (
      <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
        <AlertCircle size={36} color="var(--color-danger)" style={{ margin: '0 auto 12px' }} />
        <h3>Error Loading Workload</h3>
        <p style={{ marginTop: 8 }}>{error}</p>
        <button type="button" className="btn btn-secondary btn-sm" style={{ marginTop: 16 }} onClick={fetchDashboard}>
          Retry
        </button>
      </div>
    );
  }

  const { assignedTasks = 0, notStarted = 0, inProgress = 0, completed = 0, recentTasks = [] } = data || {};

  return (
    <div>
      <Toast
        type="success"
        message={toastMessage}
        onDismiss={() => setToastMessage('')}
      />

      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>My Workload Overview</h1>
          <p>Monitor your active task assignments, deadlines, and delivery status.</p>
        </div>

        <div className="page-actions">
          <Link to="/employee/tasks" className="btn btn-primary btn-sm">
            <span>View All My Tasks</span>
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Assigned Tasks</span>
            <div className="metric-icon-wrap" style={{ backgroundColor: '#e0e7ff', color: 'var(--primary-600)' }}>
              <CheckSquare size={18} />
            </div>
          </div>
          <div className="metric-value">{assignedTasks}</div>
          <div className="metric-desc">Total tasks allocated to you</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Not Started</span>
            <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--status-not-started-bg)', color: 'var(--status-not-started-text)' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="metric-value">{notStarted}</div>
          <div className="metric-desc">Pending commencement</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">In Progress</span>
            <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--status-in-progress-bg)', color: 'var(--status-in-progress-text)' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ color: 'var(--color-info)' }}>{inProgress}</div>
          <div className="metric-desc">Active development</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Completed</span>
            <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--status-completed-bg)', color: 'var(--status-completed-text)' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ color: 'var(--color-success)' }}>{completed}</div>
          <div className="metric-desc">Verified completed tasks</div>
        </div>
      </div>

      {/* Recent Assigned Tasks Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Recent Assignments</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tasks requiring your action</p>
          </div>
          <Link to="/employee/tasks" className="btn btn-secondary btn-sm">
            <span>View All</span>
          </Link>
        </div>

        {recentTasks.length === 0 ? (
          <EmptyState
            title="No tasks currently assigned"
            description="You are caught up! When leadership assigns tasks, they will appear in this workspace."
          />
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Task Title</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned By</th>
                  <th>Last Updated</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentTasks.map((task) => (
                  <tr key={task._id}>
                    <td>
                      <Link to={`/employee/tasks/${task._id}`} className="table-row-title">
                        {task.title}
                      </Link>
                      <span className="table-row-subtext">
                        {task.description.length > 75 ? `${task.description.slice(0, 75)}...` : task.description}
                      </span>
                    </td>
                    <td>
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td>
                      <StatusBadge status={task.status} />
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {task.assignedBy?.name || 'Administrator'}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {new Date(task.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedTaskForUpdate(task)}
                          title="Update Progress Status"
                        >
                          <Edit3 size={14} />
                          <span>Update Status</span>
                        </button>
                        <Link to={`/employee/tasks/${task._id}`} className="btn btn-secondary btn-sm">
                          Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      <StatusUpdateModal
        isOpen={Boolean(selectedTaskForUpdate)}
        onClose={() => setSelectedTaskForUpdate(null)}
        task={selectedTaskForUpdate}
        onStatusUpdated={handleStatusUpdated}
      />
    </div>
  );
}
