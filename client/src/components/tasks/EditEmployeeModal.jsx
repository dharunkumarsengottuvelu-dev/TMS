import React, { useState, useEffect } from 'react';
import { employeeService } from '../../services/employeeService.js';
import { X, User, Loader2, AlertCircle } from 'lucide-react';

const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'Sales',
  'Human Resources',
  'Finance',
  'Operations',
  'Legal',
  'Customer Success',
];

export function EditEmployeeModal({ employee, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: employee.name || '',
    role: employee.role || 'EMPLOYEE',
    department: employee.department || '',
    designation: employee.designation || '',
    phone: employee.phone || '',
    joiningDate: employee.joiningDate
      ? new Date(employee.joiningDate).toISOString().split('T')[0]
      : '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      errs.name = 'Full name must be at least 2 characters.';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: form.name.trim(),
        role: form.role,
        department: form.department || null,
        designation: form.designation.trim() || null,
        phone: form.phone.trim() || null,
        joiningDate: form.joiningDate || null,
      };

      const res = await employeeService.updateEmployee(employee._id, payload);
      onSuccess(res.data || res, 'Employee profile updated successfully.');
    } catch (err) {
      setError(err?.message || 'Failed to update employee profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container" style={{ maxWidth: 580 }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '4px',
                backgroundColor: 'var(--primary-50)',
                color: 'var(--primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <User size={16} />
            </div>
            <div>
              <h2 className="modal-title">Edit Employee Profile</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                {employee.employeeId && (
                  <span style={{ fontWeight: 600, color: 'var(--primary-600)' }}>
                    {employee.employeeId} &middot;{' '}
                  </span>
                )}
                {employee.email}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="alert alert-error" style={{ marginBottom: 14 }}>
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-section-label">Identity</div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label" htmlFor="edit-emp-name">
                  Full Name <span className="form-required">*</span>
                </label>
                <input
                  id="edit-emp-name"
                  name="name"
                  type="text"
                  className={`form-control ${fieldErrors.name ? 'form-control-error' : ''}`}
                  value={form.name}
                  onChange={handleChange}
                  autoFocus
                />
                {fieldErrors.name && <span className="form-error-msg">{fieldErrors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-emp-role">
                  Role
                </label>
                <select
                  id="edit-emp-role"
                  name="role"
                  className="form-select"
                  value={form.role}
                  onChange={handleChange}
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>

            <div className="form-section-label" style={{ marginTop: 8 }}>
              Professional Details
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label" htmlFor="edit-emp-dept">
                  Department
                </label>
                <select
                  id="edit-emp-dept"
                  name="department"
                  className="form-select"
                  value={form.department}
                  onChange={handleChange}
                >
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-emp-desig">
                  Designation
                </label>
                <input
                  id="edit-emp-desig"
                  name="designation"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Senior Developer"
                  value={form.designation}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label" htmlFor="edit-emp-phone">
                  Phone Number
                </label>
                <input
                  id="edit-emp-phone"
                  name="phone"
                  type="tel"
                  className="form-control"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-emp-joining">
                  Joining Date
                </label>
                <input
                  id="edit-emp-joining"
                  name="joiningDate"
                  type="date"
                  className="form-control"
                  value={form.joiningDate}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={14} className="spinner-icon" />
                  <span>Saving...</span>
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
