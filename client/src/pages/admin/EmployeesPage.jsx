import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { employeeService } from '../../services/employeeService.js';
import { AddEmployeeModal } from '../../components/tasks/AddEmployeeModal.jsx';
import { EditEmployeeModal } from '../../components/tasks/EditEmployeeModal.jsx';
import { Pagination } from '../../components/common/Pagination.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import {
  Search, UserPlus, Eye, RotateCcw, Users, ShieldCheck,
  UserX, ChevronDown, Mail, AlertTriangle, CheckCircle2,
  XCircle, Building2, Edit, Trash2,
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

const ROLE_OPTIONS = [
  { value: 'EMPLOYEE', label: 'Employees' },
  { value: 'ADMIN', label: 'Admins' },
  { value: 'all', label: 'All Roles' },
];

function OnboardingBadge({ status }) {
  const cfg = {
    INVITED: { label: 'Invited', color: 'var(--color-warning)', bg: 'var(--color-warning-bg, #fffbeb)' },
    ACTIVE: { label: 'Active', color: 'var(--color-success)', bg: 'var(--color-success-bg)' },
    INACTIVE: { label: 'Inactive', color: 'var(--color-danger)', bg: 'var(--color-danger-bg)' },
  };
  const c = cfg[status] || cfg.ACTIVE;
  return (
    <span className="badge" style={{ backgroundColor: c.bg, color: c.color, fontSize: '0.72rem', fontWeight: 600 }}>
      {c.label}
    </span>
  );
}

function RoleBadge({ role }) {
  return (
    <span className={`badge ${role === 'ADMIN' ? 'badge-role-admin' : 'badge-role-employee'}`} style={{ fontSize: '0.72rem' }}>
      {role}
    </span>
  );
}

function ActionMenu({
  employee,
  onEditProfile,
  onStatusToggle,
  onResendInvitation,
  onDelete,
  actionLoading,
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 'auto', bottom: 'auto', right: '0px' });
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < 240;
      setCoords({
        top: openUp ? 'auto' : `${rect.bottom + 4}px`,
        bottom: openUp ? `${window.innerHeight - rect.top + 4}px` : 'auto',
        right: `${Math.max(16, window.innerWidth - rect.right)}px`,
      });
      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    const handleOutsideClick = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    const handleScrollOrResize = () => setOpen(false);

    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [open]);

  const isLoading = actionLoading === employee._id;

  const dropdownStyle = {
    position: 'fixed',
    top: coords.top,
    bottom: coords.bottom,
    right: coords.right,
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 10,
    minWidth: 200,
    zIndex: 99999,
    boxShadow: '0 12px 36px -4px rgba(15, 23, 42, 0.22), 0 0 0 1px rgba(15, 23, 42, 0.05)',
    padding: '6px 0',
    animation: 'fadeIn 0.12s ease-out',
  };

  const itemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 16px',
    fontSize: '0.85rem',
    fontWeight: 500,
    color: '#1e293b',
    background: 'none',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'background 0.15s',
  };

  const dangerStyle = { ...itemStyle, color: '#dc2626' };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        ref={buttonRef}
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={toggleDropdown}
        disabled={isLoading}
        style={{ gap: 4, minWidth: 90 }}
      >
        {isLoading ? <span className="spinner" style={{ width: 12, height: 12 }} /> : 'Actions'}
        <ChevronDown size={12} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>

      {open && (
        <div ref={menuRef} style={dropdownStyle}>
          <Link
            to={`/admin/employees/${employee._id}`}
            style={itemStyle}
            onClick={() => setOpen(false)}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            <Eye size={15} color="#64748b" /> View Profile
          </Link>

          <button
            type="button"
            style={itemStyle}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            onClick={() => { setOpen(false); onEditProfile(employee); }}
          >
            <Edit size={15} color="#64748b" /> Edit Profile
          </button>

          {employee.onboardingStatus === 'INVITED' && (
            <button
              type="button"
              style={itemStyle}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              onClick={() => { setOpen(false); onResendInvitation(employee); }}
            >
              <Mail size={15} color="#64748b" /> Resend Invitation
            </button>
          )}

          <div style={{ height: 1, background: '#f1f5f9', margin: '4px 0' }} />

          {employee.isActive ? (
            <button
              type="button"
              style={{ ...itemStyle, color: '#d97706' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#fffbeb'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              onClick={() => { setOpen(false); onStatusToggle(employee, false); }}
            >
              <UserX size={15} color="#d97706" /> Deactivate Account
            </button>
          ) : (
            <button
              type="button"
              style={{ ...itemStyle, color: '#16a34a' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdf4'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              onClick={() => { setOpen(false); onStatusToggle(employee, true); }}
            >
              <CheckCircle2 size={15} color="#16a34a" /> Activate Account
            </button>
          )}

          <div style={{ height: 1, background: '#f1f5f9', margin: '4px 0' }} />

          <button
            type="button"
            style={dangerStyle}
            onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            onClick={() => { setOpen(false); onDelete(employee); }}
          >
            <Trash2 size={15} color="#dc2626" /> Delete Employee
          </button>
        </div>
      )}
    </div>
  );
}

const ActionDropdown = ActionMenu;

export function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('EMPLOYEE');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [departments, setDepartments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load departments on mount
  useEffect(() => {
    employeeService.getDepartments()
      .then((res) => setDepartments(Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []))
      .catch(() => {});
  }, []);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page: currentPage, limit: 10 };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterRole !== 'all') params.role = filterRole;
      if (filterDepartment) params.department = filterDepartment;

      const res = await employeeService.getEmployees(params);
      setEmployees(res.data || []);
      setPagination(res.pagination || null);
    } catch (err) {
      setError(err.message || 'Failed to load employee directory.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterStatus, filterRole, filterDepartment]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterRole('EMPLOYEE');
    setFilterDepartment('');
    setCurrentPage(1);
  };

  const handleAddSuccess = (newEmployee, msg) => {
    setShowAddModal(false);
    showToast(msg || 'Employee created successfully.');
    fetchEmployees();
  };

  const handleEditSuccess = (updatedEmployee, msg) => {
    setEditingEmployee(null);
    showToast(msg || 'Employee updated successfully.');
    fetchEmployees();
  };

  const handleStatusToggle = async (employee, activate) => {
    const confirm = window.confirm(
      activate
        ? `Activate ${employee.name}'s account?`
        : `Deactivate ${employee.name}'s account? They will immediately lose login access.`
    );
    if (!confirm) return;

    setActionLoading(employee._id);
    try {
      const res = await employeeService.updateEmployeeStatus(employee._id, activate);
      const action = activate ? 'activated' : 'deactivated';
      showToast(`${employee.name}'s account has been ${action}.`);
      // res is already the response body (interceptor unwraps it)
      if (!activate && res?.data?.activeTaskCount > 0) {
        showToast(`⚠️ ${res.data.activeTaskCount} active task(s) remain assigned to this employee.`, 'warning');
      }
      fetchEmployees();
    } catch (err) {
      showToast(err?.message || 'Action failed.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResendInvitation = async (employee) => {
    setActionLoading(employee._id);
    try {
      await employeeService.resendInvitation(employee._id);
      showToast(`Invitation email resent to ${employee.email}.`);
    } catch (err) {
      showToast(err?.message || 'Failed to resend invitation.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteEmployee = async (employee) => {
    const ok = window.confirm(
      `⚠️ Permanently delete "${employee.name}"?\n\nThis will:\n• Remove their account completely\n• Unassign all their open tasks\n\nThis action CANNOT be undone.`
    );
    if (!ok) return;

    setActionLoading(employee._id);
    try {
      await employeeService.deleteEmployee(employee._id);
      showToast(`${employee.name}'s account has been permanently deleted.`);
      fetchEmployees();
    } catch (err) {
      showToast(err?.message || 'Failed to delete employee.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const hasActiveFilters = searchTerm || filterStatus !== 'all' || filterRole !== 'EMPLOYEE' || filterDepartment;

  return (
    <div>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 24, zIndex: 9999,
          background: toast.type === 'error' ? 'var(--color-danger)' : toast.type === 'warning' ? '#d97706' : 'var(--color-success)',
          color: '#fff', padding: '12px 20px', borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', gap: 8,
          animation: 'slideInRight 0.3s ease',
          maxWidth: 400, fontSize: '0.88rem', fontWeight: 500,
        }}>
          {toast.type === 'error' ? <XCircle size={15} /> : toast.type === 'warning' ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
          {toast.msg}
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Employee Management</h1>
          <p>Manage employee accounts, onboarding status, and workload distribution.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
          id="add-employee-btn"
        >
          <UserPlus size={16} />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: 'var(--space-5)', padding: 'var(--space-4)' }}>
        <form onSubmit={handleSearchSubmit} className="filter-bar" style={{ marginBottom: 0, flexWrap: 'wrap' }}>
          <div className="search-input-wrap" style={{ flex: '1 1 220px', minWidth: 200 }}>
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, email, ID, department…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="form-control"
            style={{ width: 130 }}
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
          >
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <select
            className="form-control"
            style={{ width: 130 }}
            value={filterRole}
            onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1); }}
          >
            {ROLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <select
            className="form-control"
            style={{ width: 160 }}
            value={filterDepartment}
            onChange={(e) => { setFilterDepartment(e.target.value); setCurrentPage(1); }}
          >
            <option value="">All Departments</option>
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>

          <button type="submit" className="btn btn-secondary btn-sm">
            <Search size={14} /> Search
          </button>

          {hasActiveFilters && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleReset}>
              <RotateCcw size={14} /> Reset
            </button>
          )}
        </form>
      </div>

      {/* Employee Table */}
      <div className="card">
        {loading ? (
          <LoadingSpinner message="Loading employee directory…" />
        ) : error ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
            <p style={{ color: 'var(--color-danger)' }}>{error}</p>
            <button type="button" className="btn btn-secondary btn-sm" style={{ marginTop: 12 }} onClick={fetchEmployees}>
              Retry
            </button>
          </div>
        ) : employees.length === 0 ? (
          <EmptyState
            title="No employees found"
            description={hasActiveFilters ? 'No employees match the current filters. Try adjusting your search.' : 'No employee records yet. Click "Add Employee" to onboard your first team member.'}
            action={
              !hasActiveFilters ? (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowAddModal(true)}
                >
                  <UserPlus size={14} />
                  <span>Add Employee</span>
                </button>
              ) : null
            }
          />
        ) : (
          <>
            <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>ID / Department</th>
                    <th>Role</th>
                    <th>Onboarding</th>
                    <th style={{ textAlign: 'center' }}>Tasks</th>
                    <th style={{ textAlign: 'center' }}>Active</th>
                    <th style={{ textAlign: 'center' }}>
                      <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem' }}>Overdue</span>
                    </th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp._id} style={{ opacity: emp.isActive ? 1 : 0.6 }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: emp.isActive
                              ? 'linear-gradient(135deg, #2563eb22, #1d4ed822)'
                              : '#f1f5f9',
                            color: emp.isActive ? 'var(--primary-600)' : 'var(--text-muted)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.9rem', fontWeight: 700, flexShrink: 0,
                          }}>
                            {(emp.name || 'E').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                              {emp.name || 'Unnamed Employee'}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              {emp.email || '—'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div style={{ fontSize: '0.82rem' }}>
                          {emp.employeeId && (
                            <span style={{ fontWeight: 600, color: 'var(--primary-600)', display: 'block' }}>
                              {emp.employeeId}
                            </span>
                          )}
                          {emp.department ? (
                            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                              <Building2 size={11} /> {emp.department}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>—</span>
                          )}
                        </div>
                      </td>

                      <td><RoleBadge role={emp.role} /></td>

                      <td><OnboardingBadge status={emp.onboardingStatus || (emp.isActive ? 'ACTIVE' : 'INACTIVE')} /></td>

                      <td style={{ textAlign: 'center' }}>
                        <strong>{emp.taskStats?.totalTasks || 0}</strong>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <span style={{ color: 'var(--color-info)', fontWeight: 600 }}>
                          {(emp.taskStats?.inProgress || 0) + (emp.taskStats?.pending || 0)}
                        </span>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        {(emp.taskStats?.overdue || 0) > 0 ? (
                          <span style={{ color: 'var(--color-danger)', fontWeight: 700 }}>
                            {emp.taskStats.overdue}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <ActionMenu
                          employee={emp}
                          onStatusToggle={handleStatusToggle}
                          onResendInvitation={handleResendInvitation}
                          onEditProfile={setEditingEmployee}
                          onDelete={handleDeleteEmployee}
                          actionLoading={actionLoading}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination pagination={pagination} onPageChange={(p) => setCurrentPage(p)} />
          </>
        )}
      </div>

      {/* Summary row */}
      {pagination && !loading && (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 8 }}>
          Showing {employees.length} of {pagination.total} personnel records
        </p>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <AddEmployeeModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddSuccess}
        />
      )}

      {/* Edit Employee Modal */}
      {editingEmployee && (
        <EditEmployeeModal
          employee={editingEmployee}
          onClose={() => setEditingEmployee(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
