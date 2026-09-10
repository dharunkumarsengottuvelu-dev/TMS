import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { employeeService } from '../../services/employeeService.js';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { PriorityBadge } from '../../components/common/PriorityBadge.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { ArrowLeft, User, Mail, Calendar, CheckSquare, Clock, CheckCircle2 } from 'lucide-react';

export function EmployeeDetailsPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEmployee = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await employeeService.getEmployeeById(id);
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load employee details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEmployee();
  }, [fetchEmployee]);

  if (loading) {
    return <LoadingSpinner message="Fetching employee profile and workload data..." />;
  }

  if (error || !data) {
    return (
      <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
        <h3>Error Retrieving Employee Profile</h3>
        <p style={{ marginTop: 8 }}>{error || 'Employee not found.'}</p>
        <Link to="/admin/employees" className="btn btn-secondary btn-sm" style={{ marginTop: 16 }}>
          <ArrowLeft size={14} />
          <span>Back to Employee Directory</span>
        </Link>
      </div>
    );
  }

  const { employee, stats, recentTasks = [] } = data;

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <Link to="/admin/employees" className="btn btn-secondary btn-sm">
          <ArrowLeft size={14} />
          <span>Back to Employee Directory</span>
        </Link>
      </div>

      {/* Profile Header Card */}
      <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: '#e0e7ff',
              color: 'var(--primary-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <User size={28} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.4rem' }}>{employee.name}</h1>
              <span className="badge badge-role-employee">Staff Member</span>
              <span className="badge" style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
                Active
              </span>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-5)', marginTop: '6px', flexWrap: 'wrap', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} />
                <span>{employee.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} />
                <span>
                  Member since {new Date(employee.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workload Metrics */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Total Assigned</span>
            <div className="metric-icon-wrap" style={{ backgroundColor: '#f1f5f9', color: 'var(--text-secondary)' }}>
              <CheckSquare size={18} />
            </div>
          </div>
          <div className="metric-value">{stats.total}</div>
          <div className="metric-desc">Lifetime tasks assigned</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Not Started</span>
            <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--status-not-started-bg)', color: 'var(--status-not-started-text)' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="metric-value">{stats.notStarted}</div>
          <div className="metric-desc">Awaiting start</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Pending</span>
            <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--status-pending-bg)', color: 'var(--status-pending-text)' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ color: 'var(--color-warning)' }}>{stats.pending || 0}</div>
          <div className="metric-desc">Pending resolution</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">In Progress</span>
            <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--status-in-progress-bg)', color: 'var(--status-in-progress-text)' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ color: 'var(--color-info)' }}>{stats.inProgress}</div>
          <div className="metric-desc">Under active execution</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Completed</span>
            <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--status-completed-bg)', color: 'var(--status-completed-text)' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ color: 'var(--color-success)' }}>{stats.completed}</div>
          <div className="metric-desc">Successfully delivered</div>
        </div>
      </div>

      {/* Assigned Tasks Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Assigned Tasks</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tasks directly assigned to this employee</p>
          </div>
        </div>

        {recentTasks.length === 0 ? (
          <EmptyState
            title="No tasks assigned"
            description="This employee currently has no active or completed assignments."
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
                  <th>Updated</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
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
                      })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/admin/tasks/${task._id}`} className="btn btn-secondary btn-sm">
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
    </div>
  );
}
