import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { employeeService } from '../../services/employeeService.js';
import { AddEmployeeModal } from '../../components/tasks/AddEmployeeModal.jsx';
import { EditEmployeeModal } from '../../components/tasks/EditEmployeeModal.jsx';
import { Pagination } from '../../components/common/Pagination.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import {
  Search,
  UserPlus,
  Eye,
  RotateCcw,
  Edit2,
  Trash2,
  AlertCircle,
  Building2,
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

function StatusBadge({ isActive, onboardingStatus }) {
  if (!isActive) {
    return (
      <span
        className="badge"
        style={{
          backgroundColor: 'var(--color-danger-bg)',
          color: 'var(--color-danger)',
          border: '1px solid var(--color-danger-border)',
        }}
      >
        <span className="badge-dot" style={{ backgroundColor: 'var(--color-danger)' }} />
        Inactive
      </span>
    );
  }

  if (onboardingStatus === 'INVITED') {
    return (
      <span
        className="badge"
        style={{
          backgroundColor: 'var(--color-warning-bg)',
          color: 'var(--color-warning)',
          border: '1px solid var(--color-warning-border)',
        }}
      >
        <span className="badge-dot" style={{ backgroundColor: 'var(--color-warning)' }} />
        Invited
      </span>
    );
  }

  return (
    <span
      className="badge"
      style={{
        backgroundColor: 'var(--color-success-bg)',
        color: 'var(--color-success)',
        border: '1px solid var(--color-success-border)',
      }}
    >
      <span className="badge-dot" style={{ backgroundColor: 'var(--color-success)' }} />
      Active
    </span>
  );
}

export function EmployeesPage() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
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
    employeeService
      .getDepartments()
      .then((res) =>
        setDepartments(Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [])
      )
      .catch(() => {});
  }, []);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page: currentPage, limit: 10 };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterDepartment) params.department = filterDepartment;

      const res = await employeeService.getEmployees(params);
      setEmployees(res.data || []);
      setPagination(res.pagination || null);
    } catch (err) {
      setError(err.message || 'Failed to load employee directory.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterStatus, filterDepartment]);

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
    setFilterDepartment('');
    setCurrentPage(1);
  };

  const handleAddSuccess = (newEmployee, msg) => {
    setShowAddModal(false);
    showToast(msg || 'Employee account created successfully.');
    fetchEmployees();
  };

  const handleEditSuccess = (updatedEmployee, msg) => {
    setEditingEmployee(null);
    showToast(msg || 'Employee updated successfully.');
    fetchEmployees();
  };

  const handleDeleteEmployee = async (employee) => {
    const ok = window.confirm(
      `Permanently delete "${employee.name}"?\n\nThis will remove their account completely. This action cannot be undone.`
    );
    if (!ok) return;

    setActionLoading(employee._id);
    try {
      await employeeService.deleteEmployee(employee._id);
      showToast(`${employee.name}'s account has been deleted.`);
      fetchEmployees();
    } catch (err) {
      showToast(err?.message || 'Failed to delete employee.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      {/* Toast Notification */}
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
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Employee Management</h1>
          <p>Manage employees, accounts and access.</p>
        </div>

        <div className="page-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <UserPlus size={15} />
            <span>+ Add Employee</span>
          </button>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: '16px' }}>
        <form onSubmit={handleSearchSubmit} className="filter-bar" style={{ margin: 0 }}>
          {/* Search Input */}
          <div className="search-input-wrap">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              className="form-control"
              placeholder="Search Employees by name, email or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Department Filter */}
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: 160 }}
            value={filterDepartment}
            onChange={(e) => {
              setFilterDepartment(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: 130 }}
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Action Buttons */}
          <button type="submit" className="btn btn-secondary btn-sm" style={{ height: '36px' }}>
            Search
          </button>

          {(searchTerm || filterStatus !== 'all' || filterDepartment) && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ height: '36px' }}
              onClick={handleReset}
              title="Reset Filters"
            >
              <RotateCcw size={13} style={{ marginRight: 4 }} />
              Reset
            </button>
          )}
        </form>
      </div>

      {/* Main Table Card */}
      <div className="card">
        {loading ? (
          <LoadingSpinner message="Loading employee directory..." />
        ) : error ? (
          <div style={{ padding: 32, textAlign: 'center' }}>
            <AlertCircle size={28} color="var(--color-danger)" style={{ margin: '0 auto 8px' }} />
            <div style={{ fontWeight: 600, color: 'var(--color-danger)' }}>{error}</div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ marginTop: 12 }}
              onClick={fetchEmployees}
            >
              Retry
            </button>
          </div>
        ) : employees.length === 0 ? (
          <EmptyState
            title="No employees found"
            description={
              searchTerm || filterStatus !== 'all' || filterDepartment
                ? 'Try adjusting your search criteria or filters.'
                : 'Get started by creating your first employee profile.'
            }
            action={
              !searchTerm && filterStatus === 'all' && !filterDepartment ? (
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
                    <th style={{ width: '130px' }}>Employee ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th style={{ width: '110px' }}>Status</th>
                    <th style={{ textAlign: 'right', width: '120px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp._id} style={{ opacity: emp.isActive ? 1 : 0.7 }}>
                      {/* Employee ID */}
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--primary-600)', fontSize: '0.82rem' }}>
                          {emp.employeeId || '—'}
                        </span>
                      </td>

                      {/* Name with initial avatar */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: '50%',
                              backgroundColor: emp.isActive ? 'var(--primary-50)' : '#F1F5F9',
                              color: emp.isActive ? 'var(--primary-600)' : 'var(--text-muted)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              flexShrink: 0,
                              border: `1px solid ${emp.isActive ? 'var(--primary-200)' : '#E2E8F0'}`,
                            }}
                          >
                            {(emp.name || 'E').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <Link
                              to={`/admin/employees/${emp._id}`}
                              style={{
                                fontWeight: 600,
                                color: '#111827',
                                fontSize: '0.86rem',
                                textDecoration: 'none',
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary-600)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.color = '#111827'; }}
                            >
                              {emp.name || 'Unnamed Employee'}
                            </Link>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          {emp.email || '—'}
                        </span>
                      </td>

                      {/* Department */}
                      <td>
                        {emp.department ? (
                          <span style={{ fontSize: '0.82rem', color: '#374151', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Building2 size={12} color="#9CA3AF" />
                            {emp.department}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>

                      {/* Designation */}
                      <td>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          {emp.designation || '—'}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td>
                        <StatusBadge isActive={emp.isActive} onboardingStatus={emp.onboardingStatus} />
                      </td>

                      {/* Compact Action Icons */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          {/* View */}
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/employees/${emp._id}`)}
                            className="btn-icon"
                            title="View Details"
                            aria-label={`View ${emp.name}`}
                          >
                            <Eye size={14} />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => setEditingEmployee(emp)}
                            className="btn-icon"
                            title="Edit Employee"
                            aria-label={`Edit ${emp.name}`}
                          >
                            <Edit2 size={13} />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteEmployee(emp)}
                            className="btn-icon"
                            title="Delete Employee"
                            aria-label={`Delete ${emp.name}`}
                            disabled={actionLoading === emp._id}
                            style={{ color: '#EF4444' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FEE2E2'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <Pagination pagination={pagination} onPageChange={(p) => setCurrentPage(p)} />
          </>
        )}
      </div>

      {/* Summary Row */}
      {pagination && !loading && (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 10 }}>
          Showing {employees.length} of {pagination.total} employee records
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
