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
  Users,
  CheckSquare,
  Clock,
  ArrowUpRight,
  Plus,
  AlertCircle,
  CheckCircle2,
  Activity as ActivityIcon,
  TrendingUp,
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
    setToastMessage('Task successfully created and assigned!');
    fetchDashboardData();
  };

  if (loading) {
    return <LoadingSpinner message="Aggregating enterprise workload metrics..." />;
  }

  if (error) {
    return (
      <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
        <AlertCircle size={32} color="var(--color-danger)" style={{ margin: '0 auto 10px' }} />
        <h3>System Communication Error</h3>
        <p style={{ marginTop: 6, fontSize: '0.86rem' }}>{error}</p>
        <button
          type="button"
          className="btn btn-primary"
          style={{ marginTop: 14 }}
          onClick={fetchDashboardData}
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const {
    totalEmployees = 0,
    totalTasks = 0,
    notStarted = 0,
    pending = 0,
    inProgress = 0,
    completed = 0,
    recentTasks = [],
    recentActivities = [],
  } = data || {};

  const completionRate = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;

  return (
    <div>
      {/* Toast Notification */}
      <Toast
        type="success"
        message={toastMessage}
        onDismiss={() => setToastMessage('')}
      />

      {/* Top Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Dashboard</h1>
          <p>Real-time enterprise overview of team capacity, task lifecycles, and operational progress.</p>
        </div>

        <div className="page-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={15} />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* 4 Core KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
          marginBottom: '20px',
        }}
      >
        {/* Total Employees */}
        <Link to="/admin/employees" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="metric-card" style={{ borderLeft: '3px solid var(--primary-600)', cursor: 'pointer' }}>
            <div className="metric-header">
              <span className="metric-title">Total Employees</span>
              <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--primary-50)', color: 'var(--primary-600)' }}>
                <Users size={16} />
              </div>
            </div>
            <div className="metric-value">{totalEmployees}</div>
            <div className="metric-desc">View directory &rarr;</div>
          </div>
        </Link>

        {/* Total Tasks */}
        <Link to="/admin/tasks" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="metric-card" style={{ borderLeft: '3px solid #6B7280', cursor: 'pointer' }}>
            <div className="metric-header">
              <span className="metric-title">Total Tasks</span>
              <div className="metric-icon-wrap" style={{ backgroundColor: '#F1F3F6', color: '#4B5563' }}>
                <CheckSquare size={16} />
              </div>
            </div>
            <div className="metric-value">{totalTasks}</div>
            <div className="metric-desc">All task records &rarr;</div>
          </div>
        </Link>

        {/* In Progress */}
        <Link to="/admin/tasks?status=IN_PROGRESS" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="metric-card" style={{ borderLeft: '3px solid var(--primary-600)', cursor: 'pointer' }}>
            <div className="metric-header">
              <span className="metric-title">In Progress</span>
              <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--status-in-progress-bg)', color: 'var(--status-in-progress-text)' }}>
                <Clock size={16} />
              </div>
            </div>
            <div className="metric-value" style={{ color: 'var(--primary-600)' }}>{inProgress}</div>
            <div className="metric-desc">Active execution &rarr;</div>
          </div>
        </Link>

        {/* Completed */}
        <Link to="/admin/tasks?status=COMPLETED" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="metric-card" style={{ borderLeft: '3px solid var(--color-success)', cursor: 'pointer' }}>
            <div className="metric-header">
              <span className="metric-title">Completed</span>
              <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--status-completed-bg)', color: 'var(--color-success)' }}>
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div className="metric-value" style={{ color: 'var(--color-success)' }}>{completed}</div>
            <div className="metric-desc">{completionRate}% completion rate</div>
          </div>
        </Link>
      </div>

      {/* Main Grid: Task Overview + Right Sidebar (Progress & Recent Activity) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }} className="dashboard-main-grid">
        {/* Task Overview */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#111827' }}>Task Overview</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>Recent operational tasks and assigned personnel</p>
            </div>
            <Link to="/admin/tasks" className="btn btn-secondary btn-sm">
              <span>View All</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>

          {recentTasks.length === 0 ? (
            <EmptyState
              title="No tasks in workspace"
              description="Create a task to assign work to team members."
              action={
                <button type="button" className="btn btn-primary btn-sm" onClick={() => setIsCreateModalOpen(true)}>
                  <Plus size={13} />
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
                    <th>Assigned To</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTasks.map((task) => (
                    <tr key={task._id}>
                      <td>
                        <span className="table-row-title">{task.title}</span>
                        <span className="table-row-subtext">
                          {task.description && task.description.length > 45 ? `${task.description.slice(0, 45)}...` : task.description || 'No description'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.84rem' }}>
                          {task.assignedEmployee?.name || 'Unassigned'}
                        </span>
                      </td>
                      <td>
                        <PriorityBadge priority={task.priority} />
                      </td>
                      <td>
                        <StatusBadge status={task.status} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link to={`/admin/tasks/${task._id}`} className="btn btn-secondary btn-sm" style={{ padding: '0 8px', height: '26px' }}>
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Progress & Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Progress Card */}
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={16} color="var(--primary-600)" />
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0, color: '#111827' }}>Progress</h3>
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary-600)' }}>
                {completionRate}%
              </span>
            </div>

            {/* Progress Bar */}
            <div style={{ width: '100%', height: '8px', backgroundColor: '#E5E7EB', borderRadius: '4px', overflow: 'hidden', marginBottom: '14px' }}>
              <div
                style={{
                  width: `${completionRate}%`,
                  height: '100%',
                  backgroundColor: 'var(--primary-600)',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>

            {/* Micro Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.78rem' }}>
              <div style={{ padding: '8px', backgroundColor: '#F8FAFC', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Pending</span>
                <strong style={{ fontSize: '0.95rem', color: '#B45309' }}>{pending + notStarted}</strong>
              </div>
              <div style={{ padding: '8px', backgroundColor: '#F8FAFC', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>In Progress</span>
                <strong style={{ fontSize: '0.95rem', color: 'var(--primary-600)' }}>{inProgress}</strong>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card" style={{ padding: '16px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <ActivityIcon size={16} color="var(--primary-600)" />
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0, color: '#111827' }}>Recent Activity</h3>
            </div>

            {recentActivities.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '16px' }}>
                No recent activity recorded.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recentActivities.slice(0, 6).map((act) => (
                  <div
                    key={act._id}
                    style={{
                      fontSize: '0.78rem',
                      borderLeft: '2px solid var(--primary-600)',
                      paddingLeft: '10px',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, color: '#111827' }}>{act.actor?.name || 'User'}</span>{' '}
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {act.action === 'TASK_CREATED' && 'created task'}
                        {act.action === 'STATUS_CHANGED' && `updated status to ${act.newValue}`}
                        {act.action === 'REASSIGNED' && `reassigned to ${act.newValue}`}
                        {act.action === 'SUBTASK_ADDED' && 'added subtask'}
                        {act.action === 'SUBTASK_TOGGLED' && act.newValue}
                        {act.action === 'COMMENT_ADDED' && 'commented'}
                      </span>
                    </div>
                    {act.task?.title && (
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginTop: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        "{act.task.title}"
                      </div>
                    )}
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .dashboard-main-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Task Creation Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
}
