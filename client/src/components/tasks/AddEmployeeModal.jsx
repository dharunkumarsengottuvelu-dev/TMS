import React, { useState, useEffect } from 'react';
import { employeeService } from '../../services/employeeService.js';
import {
  X,
  User,
  AlertCircle,
} from 'lucide-react';

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

const initialForm = {
  employeeId: '',
  name: '',
  email: '',
  phone: '',
  department: '',
  designation: '',
  joiningDate: '',
  password: '',
  confirmPassword: '',
  accountStatus: 'ACTIVE',
  role: 'EMPLOYEE',
};

export function AddEmployeeModal({ onClose, onSuccess }) {
  const [form, setForm] = useState(initialForm);
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
    if (!form.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      errs.email = 'Please enter a valid email address.';
    }
    if (form.password && form.password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }
    if (form.password && form.password !== form.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
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
        email: form.email.trim().toLowerCase(),
        role: form.role,
        ...(form.employeeId.trim() && { employeeId: form.employeeId.trim() }),
        ...(form.department && { department: form.department }),
        ...(form.designation.trim() && { designation: form.designation.trim() }),
        ...(form.phone.trim() && { phone: form.phone.trim() }),
        ...(form.joiningDate && { joiningDate: form.joiningDate }),
        ...(form.password.trim() && { password: form.password.trim() }),
      };

      const res = await employeeService.createEmployee(payload);
      onSuccess(res.data || res, 'Employee account created successfully.');
    } catch (err) {
      setError(err?.message || 'Failed to create employee account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container" style={{ maxWidth: 640 }}>
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
              <h2 className="modal-title">Add Employee</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Register an employee account in the enterprise directory
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="alert alert-error" style={{ marginBottom: 14 }}>
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            {/* Row 1: Employee ID + Full Name */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-emp-id">
                  Employee ID
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 4 }}>
                    (Auto-generated if blank)
                  </span>
                </label>
                <input
                  id="reg-emp-id"
                  name="employeeId"
                  type="text"
                  className="form-control"
                  placeholder="e.g. EMP-1042"
                  value={form.employeeId}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-name">
                  Full Name <span className="form-required">*</span>
                </label>
                <input
                  id="reg-name"
                  name="name"
                  type="text"
                  className={`form-control ${fieldErrors.name ? 'form-control-error' : ''}`}
                  placeholder="e.g. Rahul Verma"
                  value={form.name}
                  onChange={handleChange}
                  autoFocus
                />
                {fieldErrors.name && <span className="form-error-msg">{fieldErrors.name}</span>}
              </div>
            </div>

            {/* Row 2: Email + Phone */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">
                  Email Address / Username <span className="form-required">*</span>
                </label>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  className={`form-control ${fieldErrors.email ? 'form-control-error' : ''}`}
                  placeholder="rahul.v@company.com"
                  value={form.email}
                  onChange={handleChange}
                />
                {fieldErrors.email && <span className="form-error-msg">{fieldErrors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-phone">
                  Phone Number
                </label>
                <input
                  id="reg-phone"
                  name="phone"
                  type="tel"
                  className="form-control"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Row 3: Department + Designation */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-department">
                  Department
                </label>
                <select
                  id="reg-department"
                  name="department"
                  className="form-select"
                  value={form.department}
                  onChange={handleChange}
                >
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-designation">
                  Designation
                </label>
                <input
                  id="reg-designation"
                  name="designation"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Software Engineer"
                  value={form.designation}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Row 4: Date of Joining + Account Status */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-joining-date">
                  Date of Joining
                </label>
                <input
                  id="reg-joining-date"
                  name="joiningDate"
                  type="date"
                  className="form-control"
                  value={form.joiningDate}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-account-status">
                  Account Status
                </label>
                <select
                  id="reg-account-status"
                  name="accountStatus"
                  className="form-select"
                  value={form.accountStatus}
                  onChange={handleChange}
                >
                  <option value="ACTIVE">Active (Immediate Portal Access)</option>
                  <option value="INVITED">Invited (Send Welcome Mail)</option>
                </select>
              </div>
            </div>

            {/* Row 5: Password + Confirm Password */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">
                  Password
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 4 }}>
                    (Auto-generated if blank)
                  </span>
                </label>
                <input
                  id="reg-password"
                  name="password"
                  type="password"
                  className={`form-control ${fieldErrors.password ? 'form-control-error' : ''}`}
                  placeholder="Set initial password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                {fieldErrors.password && <span className="form-error-msg">{fieldErrors.password}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-confirm-password">
                  Confirm Password
                </label>
                <input
                  id="reg-confirm-password"
                  name="confirmPassword"
                  type="password"
                  className={`form-control ${fieldErrors.confirmPassword ? 'form-control-error' : ''}`}
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                {fieldErrors.confirmPassword && (
                  <span className="form-error-msg">{fieldErrors.confirmPassword}</span>
                )}
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
