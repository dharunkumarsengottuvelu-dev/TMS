import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService.js';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { PriorityBadge } from '../../components/common/PriorityBadge.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { CreateTaskModal } from '../../components/tasks/CreateTaskModal.jsx';
import { Toast } from '../../components/common/Toast.jsx';
import { Users, CheckSquare, Clock, ArrowUpRight, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';

export function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardService.getAdminDashboard();
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleTaskCreated = () => {
    setToastMessage('Task successfully created and assigned to employee!');
    fetchDashboardData();
  };

  if (loading) {
    return <LoadingSpinner message="Aggregating enterprise workload metrics..." />;
  }

  if (error) {
    return (
      <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
        <AlertCircle size={36} color="var(--color-danger)" style={{ margin: '0 auto 12px' }} />
        <h3>System Communication Error</h3>
        <p style={{ marginTop: 8 }}>{error}</p>
        <button
          type="button"
          className="btn btn-primary"
          style={{ marginTop: 16 }}
          onClick={fetchDashboardData}
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { totalEmployees = 0, totalTasks = 0, notStarted = 0, pending = 0, inProgress = 0, completed = 0, recentTasks = [] } = data || {};

  return (
    <div>
      {/* Toast Notification */}
      <Toast
        type="success"
        message={toastMessage}
        onDismiss={() => setToastMessage('')}
      />

      {/* Header bar */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Enterprise Operations Dashboard</h1>
          <p>Real-time oversight of organizational workload, active tasks, and team distribution.</p>
        </div>

        <div className="page-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={16} />
            <span>Create New Task</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Active Staff</span>
            <div className="metric-icon-wrap" style={{ backgroundColor: '#e0e7ff', color: 'var(--primary-600)' }}>
              <Users size={18} />
            </div>
          </div>
          <div className="metric-value">{totalEmployees}</div>
          <div className="metric-desc">Verified employees</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Total Tasks</span>
            <div className="metric-icon-wrap" style={{ backgroundColor: '#f1f5f9', color: 'var(--text-secondary)' }}>
              <CheckSquare size={18} />
            </div>
          </div>
          <div className="metric-value">{totalTasks}</div>
          <div className="metric-desc">All task records</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Not Started</span>
            <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--status-not-started-bg)', color: 'var(--status-not-started-text)' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="metric-value">{notStarted}</div>
          <div className="metric-desc">Awaiting kickoff</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Pending</span>
            <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--status-pending-bg)', color: 'var(--status-pending-text)' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ color: 'var(--color-warning)' }}>{pending}</div>
          <div className="metric-desc">Pending prerequisites</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">In Progress</span>
            <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--status-in-progress-bg)', color: 'var(--status-in-progress-text)' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ color: 'var(--color-info)' }}>{inProgress}</div>
          <div className="metric-desc">Active execution</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Completed</span>
            <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--status-completed-bg)', color: 'var(--status-completed-text)' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ color: 'var(--color-success)' }}>{completed}</div>
          <div className="metric-desc">Delivered deliverables</div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Recent Task Activity</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Latest updates from team assignments</p>
          </div>
          <Link to="/admin/tasks" className="btn btn-secondary btn-sm">
            <span>View All Tasks</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {recentTasks.length === 0 ? (
          <EmptyState
            title="No tasks recorded in database"
            description="Create your first enterprise task above to distribute workload to employees."
            action={
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setIsCreateModalOpen(true)}>
                <Plus size={14} />
                <span>Create Task</span>
              </button>
            }
          />
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Task Title</th>
                  <th>Assigned Employee</th>
                  <th>Priority</th>
                  <th>Current Status</th>
                  <th>Last Modified</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentTasks.map((task) => (
                  <tr key={task._id}>
                    <td>
                      <span className="table-row-title">{task.title}</span>
                      <span className="table-row-subtext">
                        {task.description.length > 70 ? `${task.description.slice(0, 70)}...` : task.description}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {task.assignedEmployee?.name || 'Unassigned'}
                      </span>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {task.assignedEmployee?.email}
                      </div>
                    </td>
                    <td>
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td>
                      <StatusBadge status={task.status} />
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {new Date(task.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td>
                      <Link to={`/admin/tasks/${task._id}`} className="btn btn-secondary btn-sm">
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Task Creation Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
}
