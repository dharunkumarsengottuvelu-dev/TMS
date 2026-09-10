import React, { useState, useEffect } from 'react';
import { employeeService } from '../../services/employeeService.js';
import { X, User, Mail, Briefcase, Building2, Phone, Calendar, IdCard, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const DEPARTMENTS = [
  'Engineering', 'Product', 'Design', 'Marketing', 'Sales',
  'Human Resources', 'Finance', 'Operations', 'Legal', 'Customer Success',
];

const DESIGNATIONS = [
  'Junior Developer', 'Senior Developer', 'Lead Developer', 'Principal Engineer',
  'Product Manager', 'UX Designer', 'Data Analyst', 'DevOps Engineer',
  'QA Engineer', 'Business Analyst', 'Marketing Specialist', 'HR Manager',
  'Finance Analyst', 'Operations Manager',
];

const initialForm = {
  name: '',
  email: '',
  role: 'EMPLOYEE',
  employeeId: '',
  department: '',
  designation: '',
  phone: '',
  joiningDate: '',
};

export function AddEmployeeModal({ onClose, onSuccess }) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
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
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = 'Full name must be at least 2 characters.';
    if (!form.email.trim()) errs.email = 'Email address is required.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Please enter a valid email address.';
    if (!form.role) errs.role = 'Role is required.';
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
      };

      const res = await employeeService.createEmployee(payload);
      onSuccess(res.data, res.message || 'Employee account created successfully.');
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to create employee account.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container" style={{ maxWidth: 620 }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={18} color="#fff" />
            </div>
            <div>
              <h2 className="modal-title">Add New Employee</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Create a new employee account and send a welcome invitation</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            {/* Identity Section */}
            <div className="form-section-label">Identity</div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label" htmlFor="emp-name">
                  <User size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                  Full Name <span className="form-required">*</span>
                </label>
                <input
                  id="emp-name"
                  name="name"
                  type="text"
                  className={`form-control ${fieldErrors.name ? 'form-control-error' : ''}`}
                  placeholder="e.g. Priya Sharma"
                  value={form.name}
                  onChange={handleChange}
                  autoFocus
                />
                {fieldErrors.name && <span className="form-error-msg">{fieldErrors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="emp-email">
                  <Mail size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                  Email Address <span className="form-required">*</span>
                </label>
                <input
                  id="emp-email"
                  name="email"
                  type="email"
                  className={`form-control ${fieldErrors.email ? 'form-control-error' : ''}`}
                  placeholder="priya.sharma@company.com"
                  value={form.email}
                  onChange={handleChange}
                />
                {fieldErrors.email && <span className="form-error-msg">{fieldErrors.email}</span>}
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label" htmlFor="emp-role">
                  <Briefcase size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                  Role <span className="form-required">*</span>
                </label>
                <select
                  id="emp-role"
                  name="role"
                  className={`form-control ${fieldErrors.role ? 'form-control-error' : ''}`}
                  value={form.role}
                  onChange={handleChange}
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="emp-id">
                  <IdCard size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                  Employee ID
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 6, fontWeight: 400 }}>Auto-generated if blank</span>
                </label>
                <input
                  id="emp-id"
                  name="employeeId"
                  type="text"
                  className="form-control"
                  placeholder="e.g. EMP-1042 (optional)"
                  value={form.employeeId}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Professional Details Section */}
            <div className="form-section-label" style={{ marginTop: 8 }}>Professional Details</div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label" htmlFor="emp-department">
                  <Building2 size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                  Department
                </label>
                <select
                  id="emp-department"
                  name="department"
                  className="form-control"
                  value={form.department}
                  onChange={handleChange}
                >
                  <option value="">— Select Department —</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="emp-designation">
                  <Briefcase size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                  Designation
                </label>
                <input
                  id="emp-designation"
                  name="designation"
                  type="text"
                  className="form-control"
                  list="designation-list"
                  placeholder="e.g. Senior Developer"
                  value={form.designation}
                  onChange={handleChange}
                />
                <datalist id="designation-list">
                  {DESIGNATIONS.map((d) => <option key={d} value={d} />)}
                </datalist>
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label" htmlFor="emp-phone">
                  <Phone size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                  Phone Number
                </label>
                <input
                  id="emp-phone"
                  name="phone"
                  type="tel"
                  className="form-control"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="emp-joining">
                  <Calendar size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                  Joining Date
                </label>
                <input
                  id="emp-joining"
                  name="joiningDate"
                  type="date"
                  className="form-control"
                  value={form.joiningDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Onboarding info note */}
            <div style={{ background: 'var(--color-info-bg, #eff6ff)', border: '1px solid var(--color-info-border, #bfdbfe)', borderRadius: 8, padding: '10px 14px', fontSize: '0.82rem', color: 'var(--color-info, #1d4ed8)', display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 4 }}>
              <CheckCircle2 size={14} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>A welcome email with login instructions will be sent to the employee automatically. No password will be shared in the email.</span>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={15} className="spinner-icon" />
                  <span>Creating Account…</span>
                </>
              ) : (
                <>
                  <User size={15} />
                  <span>Create Employee</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
