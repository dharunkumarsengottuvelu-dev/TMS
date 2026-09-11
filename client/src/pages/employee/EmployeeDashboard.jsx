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
    setToastMessage('Task status updated successfully.');
    fetchDashboard();
  };

  if (loading) {
    return <LoadingSpinner message="Loading your assigned workload..." />;
  }

  if (error) {
    return (
      <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
        <AlertCircle size={32} color="var(--color-danger)" style={{ margin: '0 auto 10px' }} />
        <h3>Error Loading Workload</h3>
        <p style={{ marginTop: 6, fontSize: '0.86rem' }}>{error}</p>
        <button type="button" className="btn btn-secondary btn-sm" style={{ marginTop: 14 }} onClick={fetchDashboard}>
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
          <h1>My Dashboard</h1>
          <p>Monitor your active assignments, delivery status, and priorities.</p>
        </div>

        <div className="page-actions">
          <Link to="/employee/tasks" className="btn btn-primary btn-sm">
            <span>View All My Tasks</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div
        className="metrics-grid"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          marginBottom: '20px',
        }}
      >
        <div className="metric-card" style={{ borderLeft: '3px solid var(--primary-600)' }}>
          <div className="metric-header">
            <span className="metric-title">Assigned Tasks</span>
            <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--primary-50)', color: 'var(--primary-600)' }}>
              <CheckSquare size={16} />
            </div>
          </div>
          <div className="metric-value">{assignedTasks}</div>
          <div className="metric-desc">Total tasks allocated to you</div>
        </div>

        <div className="metric-card" style={{ borderLeft: '3px solid #6B7280' }}>
          <div className="metric-header">
            <span className="metric-title">Not Started</span>
            <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--status-not-started-bg)', color: 'var(--status-not-started-text)' }}>
              <Clock size={16} />
            </div>
          </div>
          <div className="metric-value">{notStarted}</div>
          <div className="metric-desc">Pending kickoff</div>
        </div>

        <div className="metric-card" style={{ borderLeft: '3px solid var(--primary-600)' }}>
          <div className="metric-header">
            <span className="metric-title">In Progress</span>
            <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--status-in-progress-bg)', color: 'var(--status-in-progress-text)' }}>
              <Clock size={16} />
            </div>
          </div>
          <div className="metric-value" style={{ color: 'var(--primary-600)' }}>{inProgress}</div>
          <div className="metric-desc">Active execution</div>
        </div>

        <div className="metric-card" style={{ borderLeft: '3px solid var(--color-success)' }}>
          <div className="metric-header">
            <span className="metric-title">Completed</span>
            <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--status-completed-bg)', color: 'var(--color-success)' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="metric-value" style={{ color: 'var(--color-success)' }}>{completed}</div>
          <div className="metric-desc">Verified deliverables</div>
        </div>
      </div>

      {/* Recent Assigned Tasks Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#111827' }}>Recent Assignments</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>Active tasks requiring your attention</p>
          </div>
          <Link to="/employee/tasks" className="btn btn-secondary btn-sm">
            <span>View All</span>
          </Link>
        </div>

        {recentTasks.length === 0 ? (
          <EmptyState
            title="No tasks currently assigned"
            description="You are caught up! When management assigns tasks, they will appear in this workspace."
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
                      <Link
                        to={`/employee/tasks/${task._id}`}
                        className="table-row-title"
                        style={{ color: '#111827', textDecoration: 'none' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary-600)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#111827'; }}
                      >
                        {task.title}
                      </Link>
                      <span className="table-row-subtext">
                        {task.description && task.description.length > 70 ? `${task.description.slice(0, 70)}...` : task.description || 'No description'}
                      </span>
                    </td>
                    <td>
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td>
                      <StatusBadge status={task.status} />
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#374151' }}>
                      {task.assignedBy?.name || 'Administrator'}
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {new Date(task.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '4px' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ height: '26px', padding: '0 8px', fontSize: '0.76rem' }}
                          onClick={() => setSelectedTaskForUpdate(task)}
                          title="Update Task Status"
                        >
                          <Edit3 size={12} style={{ marginRight: 3 }} />
                          <span>Status</span>
                        </button>
                        <Link
                          to={`/employee/tasks/${task._id}`}
                          className="btn btn-secondary btn-sm"
                          style={{ height: '26px', padding: '0 8px', fontSize: '0.76rem' }}
                        >
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
