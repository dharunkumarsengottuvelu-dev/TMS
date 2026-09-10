import React, { useState, useEffect } from 'react';
import { employeeService } from '../../services/employeeService.js';
import { X, User, Briefcase, Building2, Phone, Calendar, Loader2, AlertCircle } from 'lucide-react';

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

export function EditEmployeeModal({ employee, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: employee.name || '',
    role: employee.role || 'EMPLOYEE',
    department: employee.department || '',
    designation: employee.designation || '',
    phone: employee.phone || '',
    joiningDate: employee.joiningDate ? new Date(employee.joiningDate).toISOString().split('T')[0] : '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

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
      onSuccess(res.data, 'Employee profile updated successfully.');
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to update employee profile.';
      setError(msg);
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
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={18} color="#fff" />
            </div>
            <div>
              <h2 className="modal-title">Edit Employee Profile</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                {employee.employeeId && <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{employee.employeeId} · </span>}
                {employee.email}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-section-label">Identity</div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label" htmlFor="edit-emp-name">
                  <User size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
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
                  <Briefcase size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                  Role
                </label>
                <select
                  id="edit-emp-role"
                  name="role"
                  className="form-control"
                  value={form.role}
                  onChange={handleChange}
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>

            <div className="form-section-label" style={{ marginTop: 8 }}>Professional Details</div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label" htmlFor="edit-emp-dept">
                  <Building2 size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                  Department
                </label>
                <select
                  id="edit-emp-dept"
                  name="department"
                  className="form-control"
                  value={form.department}
                  onChange={handleChange}
                >
                  <option value="">— Select Department —</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-emp-desig">
                  <Briefcase size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                  Designation
                </label>
                <input
                  id="edit-emp-desig"
                  name="designation"
                  type="text"
                  className="form-control"
                  list="edit-designation-list"
                  placeholder="e.g. Senior Developer"
                  value={form.designation}
                  onChange={handleChange}
                />
                <datalist id="edit-designation-list">
                  {DESIGNATIONS.map((d) => <option key={d} value={d} />)}
                </datalist>
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label" htmlFor="edit-emp-phone">
                  <Phone size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
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
                  <Calendar size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
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
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={15} className="spinner-icon" />
                  <span>Saving…</span>
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
