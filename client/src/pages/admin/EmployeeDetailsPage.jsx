import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { employeeService } from '../../services/employeeService.js';
import { EditEmployeeModal } from '../../components/tasks/EditEmployeeModal.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { PriorityBadge } from '../../components/common/PriorityBadge.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import {
  ArrowLeft, User, Mail, Calendar, CheckSquare, Clock, CheckCircle2,
  Pencil, UserX, RefreshCw, AlertTriangle, Building2, Phone, IdCard,
  Briefcase, AlertCircle, XCircle, TrendingUp,
} from 'lucide-react';

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
      <Icon size={14} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 2 }} />
      <div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{label}</span>
        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, iconBg, iconColor, valueColor }) {
  return (
    <div className="metric-card">
      <div className="metric-header">
        <span className="metric-title">{title}</span>
        <div className="metric-icon-wrap" style={{ backgroundColor: iconBg, color: iconColor }}>
          <Icon size={18} />
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
    setTimeout(() => setToast(null), 4500);
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

  useEffect(() => { fetchEmployee(); }, [fetchEmployee]);

  const handleEditSuccess = (updatedEmployee, msg) => {
    setShowEditModal(false);
    showToast(msg || 'Profile updated.');
    fetchEmployee();
  };

  const handleStatusToggle = async () => {
    const { employee } = data;
    const activate = !employee.isActive;
    const confirmMsg = activate
      ? `Activate ${employee.name}'s account?`
      : `Deactivate ${employee.name}'s account? They will immediately lose login access.`;
    if (!window.confirm(confirmMsg)) return;

    setActionLoading(true);
    try {
      const res = await employeeService.updateEmployeeStatus(employee._id, activate);
      const action = activate ? 'activated' : 'deactivated';
      showToast(`${employee.name}'s account has been ${action}.`);
      if (!activate && res.data?.activeTaskCount > 0) {
        showToast(`⚠️ ${res.data.activeTaskCount} active task(s) remain assigned. Consider reassigning them.`, 'warning');
      }
      fetchEmployee();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Action failed.', 'error');
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
      showToast(err?.response?.data?.message || 'Failed to resend invitation.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Fetching employee profile and workload data…" />;
  if (error || !data) {
    return (
      <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
        <h3>Error Retrieving Employee Profile</h3>
        <p style={{ marginTop: 8 }}>{error || 'Employee not found.'}</p>
        <Link to="/admin/employees" className="btn btn-secondary btn-sm" style={{ marginTop: 16 }}>
          <ArrowLeft size={14} /> <span>Back to Employee Directory</span>
        </Link>
      </div>
    );
  }

  const { employee, stats, recentTasks = [] } = data;

  const onboardingStatusCfg = {
    INVITED: { label: 'Invited — Awaiting Login', color: 'var(--color-warning)', bg: '#fffbeb' },
    ACTIVE: { label: 'Active', color: 'var(--color-success)', bg: 'var(--color-success-bg)' },
    INACTIVE: { label: 'Deactivated', color: 'var(--color-danger)', bg: 'var(--color-danger-bg)' },
  };
  const obStatus = onboardingStatusCfg[employee.onboardingStatus] || onboardingStatusCfg.ACTIVE;

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 24, zIndex: 9999,
          background: toast.type === 'error' ? 'var(--color-danger)' : toast.type === 'warning' ? '#d97706' : 'var(--color-success)',
          color: '#fff', padding: '12px 20px', borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', gap: 8,
          maxWidth: 400, fontSize: '0.88rem', fontWeight: 500,
          animation: 'slideInRight 0.3s ease',
        }}>
          {toast.type === 'error' ? <XCircle size={15} /> : toast.type === 'warning' ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
          {toast.msg}
        </div>
      )}

      {/* Back Navigation */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <Link to="/admin/employees" className="btn btn-secondary btn-sm">
          <ArrowLeft size={14} /> <span>Back to Employee Directory</span>
        </Link>
      </div>

      {/* Profile Header Card */}
      <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-5)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-5)', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: 68, height: 68, borderRadius: '50%',
            background: employee.isActive ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : '#e2e8f0',
            color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.6rem', fontWeight: 700, flexShrink: 0,
          }}>
            {employee.name.charAt(0).toUpperCase()}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
              <h1 style={{ fontSize: '1.35rem', margin: 0 }}>{employee.name}</h1>
              <span className={`badge ${employee.role === 'ADMIN' ? 'badge-role-admin' : 'badge-role-employee'}`}>
                {employee.role}
              </span>
              <span className="badge" style={{ backgroundColor: obStatus.bg, color: obStatus.color, fontSize: '0.72rem' }}>
                {obStatus.label}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '4px 20px' }}>
              {employee.employeeId && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', color: 'var(--primary-600)', fontWeight: 700 }}>
                  <IdCard size={13} /> {employee.employeeId}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <Mail size={13} /> {employee.email}
              </div>
              {employee.department && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <Building2 size={13} /> {employee.department}
                </div>
              )}
              {employee.designation && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <Briefcase size={13} /> {employee.designation}
                </div>
              )}
              {employee.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <Phone size={13} /> {employee.phone}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <Calendar size={13} />
                {employee.joiningDate
                  ? `Joined ${new Date(employee.joiningDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                  : `Member since ${new Date(employee.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setShowEditModal(true)}
              disabled={actionLoading}
            >
              <Pencil size={14} /> Edit Profile
            </button>

            {employee.onboardingStatus === 'INVITED' && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleResendInvitation}
                disabled={actionLoading}
                title="Resend welcome invitation email"
              >
                <RefreshCw size={14} /> Resend Invitation
              </button>
            )}

            {employee.isActive ? (
              <button
                className="btn btn-sm"
                style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)' }}
                onClick={handleStatusToggle}
                disabled={actionLoading}
              >
                <UserX size={14} /> Deactivate
              </button>
            ) : (
              <button
                className="btn btn-sm"
                style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)', border: '1px solid var(--color-success)' }}
                onClick={handleStatusToggle}
                disabled={actionLoading}
              >
                <CheckCircle2 size={14} /> Activate
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Workload Metrics */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', marginBottom: 'var(--space-5)' }}>
        <StatCard title="Total Assigned" value={stats.total} icon={CheckSquare} iconBg="#f1f5f9" iconColor="var(--text-secondary)" />
        <StatCard title="Not Started" value={stats.notStarted} icon={Clock} iconBg="var(--status-not-started-bg)" iconColor="var(--status-not-started-text)" />
        <StatCard title="Pending" value={stats.pending || 0} icon={Clock} iconBg="var(--status-pending-bg)" iconColor="var(--status-pending-text)" valueColor="var(--color-warning)" />
        <StatCard title="In Progress" value={stats.inProgress} icon={Clock} iconBg="var(--status-in-progress-bg)" iconColor="var(--status-in-progress-text)" valueColor="var(--color-info)" />
        <StatCard title="Completed" value={stats.completed} icon={CheckCircle2} iconBg="var(--status-completed-bg)" iconColor="var(--status-completed-text)" valueColor="var(--color-success)" />
        <StatCard
          title="Overdue"
          value={stats.overdue || 0}
          icon={AlertCircle}
          iconBg="var(--color-danger-bg)"
          iconColor="var(--color-danger)"
          valueColor={stats.overdue > 0 ? 'var(--color-danger)' : undefined}
        />
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Completion Rate</span>
            <div className="metric-icon-wrap" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ color: stats.completionRate >= 70 ? 'var(--color-success)' : stats.completionRate >= 40 ? 'var(--color-warning)' : 'var(--color-danger)' }}>
            {stats.completionRate}%
          </div>
          <div className="metric-desc">Tasks delivered</div>
        </div>
      </div>

      {/* Assigned Tasks */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Assigned Tasks</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tasks directly assigned to this employee</p>
          </div>
          <Link to={`/admin/tasks?employee=${id}`} className="btn btn-secondary btn-sm">
            View All Tasks
          </Link>
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
                        <span style={{ display: 'block', color: 'var(--color-danger)', fontSize: '0.72rem', fontWeight: 600, marginTop: 2 }}>
                          <AlertTriangle size={11} style={{ verticalAlign: 'middle' }} /> Overdue
                        </span>
                      )}
                    </td>
                    <td><PriorityBadge priority={task.priority} /></td>
                    <td><StatusBadge status={task.status} /></td>
                    <td style={{ fontSize: '0.82rem', color: task.isOverdue ? 'var(--color-danger)' : 'var(--text-muted)' }}>
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'}
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{task.assignedBy?.name || 'Administrator'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/admin/tasks/${task._id}`} className="btn btn-secondary btn-sm">View</Link>
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
