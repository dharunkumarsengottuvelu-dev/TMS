import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService.js';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { PriorityBadge } from '../../components/common/PriorityBadge.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { CreateTaskModal } from '../../components/tasks/CreateTaskModal.jsx';
import { Toast } from '../../components/common/Toast.jsx';
import {
  Users, UserCheck, UserX, CheckSquare,
  Clock, ArrowUpRight, Plus, AlertCircle,
  CheckCircle2, AlertTriangle, Activity as ActivityIcon,
  UserPlus,
} from 'lucide-react';

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

  const {
    totalEmployees = 0,
    activeEmployees = 0,
    inactiveEmployees = 0,
    employeesWithOverdue = 0,
    totalTasks = 0,
    notStarted = 0,
    pending = 0,
    inProgress = 0,
    completed = 0,
    overdueTasks = 0,
    recentTasks = [],
    recentActivities = [],
  } = data || {};

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

      {/* Employee Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
        <Link to="/admin/employees" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="metric-card" style={{ cursor: 'pointer', borderLeft: '4px solid var(--primary-600)' }}>
            <div className="metric-header">
              <span className="metric-title">Total Employees</span>
              <div className="metric-icon-wrap" style={{ backgroundColor: '#e0e7ff', color: 'var(--primary-600)' }}>
                <Users size={18} />
              </div>
            </div>
            <div className="metric-value">{totalEmployees}</div>
            <div className="metric-desc">Manage directory &rarr;</div>
          </div>
        </Link>

        <Link to="/admin/employees?status=ACTIVE" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="metric-card" style={{ cursor: 'pointer', borderLeft: '4px solid var(--color-success)' }}>
            <div className="metric-header">
              <span className="metric-title">Active Staff</span>
              <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
                <UserCheck size={18} />
              </div>
            </div>
            <div className="metric-value" style={{ color: 'var(--color-success)' }}>{activeEmployees}</div>
            <div className="metric-desc">Currently active</div>
          </div>
        </Link>

        <Link to="/admin/employees?status=INACTIVE" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="metric-card" style={{ cursor: 'pointer', borderLeft: '4px solid var(--color-warning)' }}>
            <div className="metric-header">
              <span className="metric-title">Inactive Staff</span>
              <div className="metric-icon-wrap" style={{ backgroundColor: '#fffbeb', color: '#d97706' }}>
                <UserX size={18} />
              </div>
            </div>
            <div className="metric-value" style={{ color: inactiveEmployees > 0 ? '#d97706' : undefined }}>{inactiveEmployees}</div>
            <div className="metric-desc">Deactivated accounts</div>
          </div>
        </Link>

        <Link to="/admin/employees" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="metric-card" style={{ cursor: 'pointer', borderLeft: `4px solid ${employeesWithOverdue > 0 ? 'var(--color-danger)' : 'var(--border-color)'}` }}>
            <div className="metric-header">
              <span className="metric-title">With Overdue</span>
              <div className="metric-icon-wrap" style={{ backgroundColor: employeesWithOverdue > 0 ? 'var(--color-danger-bg)' : '#f1f5f9', color: employeesWithOverdue > 0 ? 'var(--color-danger)' : 'var(--text-muted)' }}>
                <AlertTriangle size={18} />
              </div>
            </div>
            <div className="metric-value" style={{ color: employeesWithOverdue > 0 ? 'var(--color-danger)' : undefined }}>{employeesWithOverdue}</div>
            <div className="metric-desc">Employees with overdue tasks</div>
          </div>
        </Link>
      </div>

      {/* Interactive Task Metrics Grid */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        <Link to="/admin/tasks" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="metric-card" style={{ cursor: 'pointer', height: '100%' }}>
            <div className="metric-header">
              <span className="metric-title">Total Tasks</span>
              <div className="metric-icon-wrap" style={{ backgroundColor: '#f1f5f9', color: 'var(--text-secondary)' }}>
                <CheckSquare size={18} />
              </div>
            </div>
            <div className="metric-value">{totalTasks}</div>
            <div className="metric-desc">All records &rarr;</div>
          </div>
        </Link>


        <Link to="/admin/tasks?status=NOT_STARTED" style={{ textDecoration: 'none', color: 'inherit' }}>

          <div className="metric-card" style={{ cursor: 'pointer', height: '100%' }}>
            <div className="metric-header">
              <span className="metric-title">Not Started</span>
              <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--status-not-started-bg)', color: 'var(--status-not-started-text)' }}>
                <Clock size={18} />
              </div>
            </div>
            <div className="metric-value">{notStarted}</div>
            <div className="metric-desc">Drill down &rarr;</div>
          </div>
        </Link>

        <Link to="/admin/tasks?status=PENDING" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="metric-card" style={{ cursor: 'pointer', height: '100%' }}>
            <div className="metric-header">
              <span className="metric-title">Pending</span>
              <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--status-pending-bg)', color: 'var(--status-pending-text)' }}>
                <Clock size={18} />
              </div>
            </div>
            <div className="metric-value" style={{ color: 'var(--color-warning)' }}>{pending}</div>
            <div className="metric-desc">Drill down &rarr;</div>
          </div>
        </Link>

        <Link to="/admin/tasks?status=IN_PROGRESS" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="metric-card" style={{ cursor: 'pointer', height: '100%' }}>
            <div className="metric-header">
              <span className="metric-title">In Progress</span>
              <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--status-in-progress-bg)', color: 'var(--status-in-progress-text)' }}>
                <Clock size={18} />
              </div>
            </div>
            <div className="metric-value" style={{ color: 'var(--color-info)' }}>{inProgress}</div>
            <div className="metric-desc">Drill down &rarr;</div>
          </div>
        </Link>

        <Link to="/admin/tasks?status=COMPLETED" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="metric-card" style={{ cursor: 'pointer', height: '100%' }}>
            <div className="metric-header">
              <span className="metric-title">Completed</span>
              <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--status-completed-bg)', color: 'var(--status-completed-text)' }}>
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="metric-value" style={{ color: 'var(--color-success)' }}>{completed}</div>
            <div className="metric-desc">Drill down &rarr;</div>
          </div>
        </Link>

        <Link to="/admin/tasks?filter=overdue" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div
            className="metric-card"
            style={{
              cursor: 'pointer',
              height: '100%',
              backgroundColor: overdueTasks > 0 ? '#fff1f2' : undefined,
              borderColor: overdueTasks > 0 ? '#fecdd3' : undefined,
            }}
          >
            <div className="metric-header">
              <span className="metric-title" style={{ color: overdueTasks > 0 ? '#9f1239' : undefined }}>
                Overdue Tasks
              </span>
              <div className="metric-icon-wrap" style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}>
                <AlertTriangle size={18} />
              </div>
            </div>
            <div className="metric-value" style={{ color: '#b91c1c' }}>{overdueTasks}</div>
            <div className="metric-desc" style={{ color: '#9f1239' }}>Requires attention &rarr;</div>
          </div>
        </Link>
      </div>

      {/* Main Grid: Recent Tasks Table + Recent System Activity Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)', marginTop: 'var(--space-6)' }}>
        {/* Recent Tasks */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Recent Task Assignments</h3>
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
                    <th>Assigned Staff</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTasks.map((task) => (
                    <tr key={task._id}>
                      <td>
                        <span className="table-row-title">{task.title}</span>
                        <span className="table-row-subtext">
                          {task.description.length > 50 ? `${task.description.slice(0, 50)}...` : task.description}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {task.assignedEmployee?.name || 'Unassigned'}
                        </span>
                      </td>
                      <td>
                        <PriorityBadge priority={task.priority} />
                      </td>
                      <td>
                        <StatusBadge status={task.status} />
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

        {/* Live Recent Activity Feed */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            <ActivityIcon size={18} color="var(--primary-600)" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Recent System Activity</h3>
          </div>

          {recentActivities.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: 'var(--space-6)' }}>
              No recent audit activity.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {recentActivities.map((act) => (
                <div
                  key={act._id}
                  style={{
                    fontSize: '0.82rem',
                    borderLeft: '2px solid var(--primary-400)',
                    paddingLeft: 'var(--space-3)',
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600 }}>{act.actor?.name || 'User'}</span>{' '}
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {act.action === 'TASK_CREATED' && 'created task'}
                      {act.action === 'STATUS_CHANGED' && `updated status to ${act.newValue}`}
                      {act.action === 'REASSIGNED' && `reassigned to ${act.newValue}`}
                      {act.action === 'SUBTASK_ADDED' && 'added subtask'}
                      {act.action === 'SUBTASK_TOGGLED' && act.newValue}
                      {act.action === 'COMMENT_ADDED' && 'commented on task'}
                    </span>
                  </div>
                  {act.task?.title && (
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginTop: 2 }}>
                      "{act.task.title}"
                    </div>
                  )}
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
