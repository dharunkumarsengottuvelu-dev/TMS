import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { employeeService } from '../../services/employeeService.js';
import { EditEmployeeModal } from '../../components/tasks/EditEmployeeModal.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { PriorityBadge } from '../../components/common/PriorityBadge.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import {
  ArrowLeft,
  Mail,
  Calendar,
  CheckSquare,
  Clock,
  CheckCircle2,
  Pencil,
  UserX,
  RefreshCw,
  AlertTriangle,
  Building2,
  Phone,
  IdCard,
  Briefcase,
  XCircle,
  TrendingUp,
} from 'lucide-react';

function StatCard({ title, value, icon: Icon, iconBg, iconColor, valueColor }) {
  return (
    <div className="metric-card">
      <div className="metric-header">
        <span className="metric-title">{title}</span>
        <div className="metric-icon-wrap" style={{ backgroundColor: iconBg, color: iconColor }}>
          <Icon size={16} />
        </div>
      </div>
      <div className="metric-value" style={valueColor ? { color: valueColor } : {}}>
        {value}
      </div>
    </div>
  );
}

export function EmployeeDetailsPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchEmployee = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await employeeService.getEmployeeById(id);
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load employee details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEmployee();
  }, [fetchEmployee]);

  const handleEditSuccess = (updatedEmployee, msg) => {
    setShowEditModal(false);
    showToast(msg || 'Profile updated successfully.');
    fetchEmployee();
  };

  const handleStatusToggle = async () => {
    const { employee } = data;
    const activate = !employee.isActive;
    const confirmMsg = activate
      ? `Activate ${employee.name}'s account?`
      : `Deactivate ${employee.name}'s account? They will lose access to the portal.`;
    if (!window.confirm(confirmMsg)) return;

    setActionLoading(true);
    try {
      const res = await employeeService.updateEmployeeStatus(employee._id, activate);
      const action = activate ? 'activated' : 'deactivated';
      showToast(`${employee.name}'s account has been ${action}.`);
      if (!activate && res?.data?.activeTaskCount > 0) {
        showToast(`⚠️ ${res.data.activeTaskCount} active task(s) remain assigned.`, 'warning');
      }
      fetchEmployee();
    } catch (err) {
      showToast(err?.message || 'Action failed.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResendInvitation = async () => {
    setActionLoading(true);
    try {
      await employeeService.resendInvitation(data.employee._id);
      showToast(`Invitation email resent to ${data.employee.email}.`);
    } catch (err) {
      showToast(err?.message || 'Failed to resend invitation.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Fetching employee profile and workload data..." />;
  if (error || !data) {
    return (
      <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
        <h3>Error Retrieving Employee Profile</h3>
        <p style={{ marginTop: 6, fontSize: '0.86rem' }}>{error || 'Employee not found.'}</p>
        <Link to="/admin/employees" className="btn btn-secondary btn-sm" style={{ marginTop: 14 }}>
          <ArrowLeft size={13} /> <span>Back to Employee Management</span>
        </Link>
      </div>
    );
  }

  const { employee, stats, recentTasks = [] } = data;

  const onboardingStatusCfg = {
    INVITED: { label: 'Invited', color: 'var(--color-warning)', bg: 'var(--color-warning-bg)' },
    ACTIVE: { label: 'Active', color: 'var(--color-success)', bg: 'var(--color-success-bg)' },
    INACTIVE: { label: 'Deactivated', color: 'var(--color-danger)', bg: 'var(--color-danger-bg)' },
  };
  const obStatus = onboardingStatusCfg[employee.onboardingStatus] || onboardingStatusCfg.ACTIVE;

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div
          className={`alert ${toast.type === 'error' ? 'alert-error' : 'alert-success'}`}
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 9999,
            boxShadow: 'var(--shadow-lg)',
            maxWidth: 380,
          }}
        >
          {toast.type === 'error' ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Back Navigation */}
      <div style={{ marginBottom: '14px' }}>
        <Link to="/admin/employees" className="btn btn-secondary btn-sm">
          <ArrowLeft size={13} /> <span>Back to Employee Management</span>
        </Link>
      </div>

      {/* Profile Header Card */}
      <div className="card" style={{ padding: '18px 20px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: employee.isActive ? 'var(--primary-600)' : '#E2E8F0',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {employee.name.charAt(0).toUpperCase()}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
              <h1 style={{ fontSize: '1.25rem', margin: 0, color: '#111827' }}>{employee.name}</h1>
              <span className={`badge ${employee.role === 'ADMIN' ? 'badge-role-admin' : 'badge-role-employee'}`}>
                {employee.role}
              </span>
              <span
                className="badge"
                style={{ backgroundColor: obStatus.bg, color: obStatus.color, border: `1px solid ${obStatus.color}40` }}
              >
                {obStatus.label}
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '4px 16px',
                marginTop: '6px',
              }}
            >
              {employee.employeeId && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: 'var(--primary-600)', fontWeight: 600 }}>
                  <IdCard size={12} /> {employee.employeeId}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <Mail size={12} /> {employee.email}
              </div>
              {employee.department && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <Building2 size={12} /> {employee.department}
                </div>
              )}
              {employee.designation && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <Briefcase size={12} /> {employee.designation}
                </div>
              )}
              {employee.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <Phone size={12} /> {employee.phone}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <Calendar size={12} />
                {employee.joiningDate
                  ? `Joined ${new Date(employee.joiningDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                  : `Member since ${new Date(employee.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setShowEditModal(true)}
              disabled={actionLoading}
            >
              <Pencil size={13} /> Edit Profile
            </button>

            {employee.onboardingStatus === 'INVITED' && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleResendInvitation}
                disabled={actionLoading}
                title="Resend welcome invitation email"
              >
                <RefreshCw size={13} /> Resend Invite
              </button>
            )}

            {employee.isActive ? (
              <button
                type="button"
                className="btn btn-sm"
                style={{
                  background: 'var(--color-danger-bg)',
                  color: 'var(--color-danger)',
                  borderColor: 'var(--color-danger-border)',
                }}
                onClick={handleStatusToggle}
                disabled={actionLoading}
              >
                <UserX size={13} /> Deactivate
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-sm"
                style={{
                  background: 'var(--color-success-bg)',
                  color: 'var(--color-success)',
                  borderColor: 'var(--color-success-border)',
                }}
                onClick={handleStatusToggle}
                disabled={actionLoading}
              >
                <CheckCircle2 size={13} /> Activate
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Workload Metrics */}
      <div
        className="metrics-grid"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          marginBottom: '16px',
        }}
      >
        <StatCard title="Total Assigned" value={stats.total} icon={CheckSquare} iconBg="#F1F3F6" iconColor="#4B5563" />
        <StatCard title="Not Started" value={stats.notStarted} icon={Clock} iconBg="var(--status-not-started-bg)" iconColor="var(--status-not-started-text)" />
        <StatCard title="Pending" value={stats.pending || 0} icon={Clock} iconBg="var(--status-pending-bg)" iconColor="var(--status-pending-text)" valueColor="var(--color-warning)" />
        <StatCard title="In Progress" value={stats.inProgress} icon={Clock} iconBg="var(--status-in-progress-bg)" iconColor="var(--status-in-progress-text)" valueColor="var(--primary-600)" />
        <StatCard title="Completed" value={stats.completed} icon={CheckCircle2} iconBg="var(--status-completed-bg)" iconColor="var(--color-success)" valueColor="var(--color-success)" />
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Completion</span>
            <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--status-completed-bg)', color: 'var(--color-success)' }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="metric-value" style={{ color: stats.completionRate >= 70 ? 'var(--color-success)' : 'var(--primary-600)' }}>
            {stats.completionRate}%
          </div>
          <div className="metric-desc">Delivery rate</div>
        </div>
      </div>

      {/* Assigned Tasks Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#111827' }}>Assigned Tasks</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
              Active and completed workload assigned to {employee.name}
            </p>
          </div>
          <Link to={`/admin/tasks?employee=${id}`} className="btn btn-secondary btn-sm">
            View All Tasks
          </Link>
        </div>

        {recentTasks.length === 0 ? (
          <EmptyState
            title="No tasks assigned"
            description="This employee currently has no active or historical task assignments."
          />
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Task Title</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Assigned By</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentTasks.map((task) => (
                  <tr key={task._id} style={{ opacity: task.isArchived ? 0.5 : 1 }}>
                    <td>
                      <span className="table-row-title">{task.title}</span>
                      {task.isOverdue && (
                        <span style={{ display: 'block', color: 'var(--color-danger)', fontSize: '0.7rem', fontWeight: 600, marginTop: 2 }}>
                          <AlertTriangle size={11} style={{ verticalAlign: 'middle' }} /> Overdue
                        </span>
                      )}
                    </td>
                    <td><PriorityBadge priority={task.priority} /></td>
                    <td><StatusBadge status={task.status} /></td>
                    <td style={{ fontSize: '0.8rem', color: task.isOverdue ? 'var(--color-danger)' : 'var(--text-muted)' }}>
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'}
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>{task.assignedBy?.name || 'Administrator'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/admin/tasks/${task._id}`} className="btn btn-secondary btn-sm" style={{ height: '26px', padding: '0 8px' }}>
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

      {/* Edit Employee Modal */}
      {showEditModal && (
        <EditEmployeeModal
          employee={employee}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
