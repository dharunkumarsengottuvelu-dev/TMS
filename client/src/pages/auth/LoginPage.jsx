import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Layers, Shield, User, ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';

export function LoginPage() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  // Portal tab selection: 'ADMIN' | 'EMPLOYEE'
  const [activePortal, setActivePortal] = useState('ADMIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // If already authenticated, redirect to role-specific dashboard
  if (user) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/employee/dashboard'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');
      const authenticatedUser = await login({ email, password });

      // Enforce portal-role compatibility
      if (activePortal === 'ADMIN' && authenticatedUser.role !== 'ADMIN') {
        await logout();
        setErrorMessage('Access Denied: This account belongs to an Employee. Please switch to the Employee Workspace tab.');
        return;
      }

      if (activePortal === 'EMPLOYEE' && authenticatedUser.role !== 'EMPLOYEE') {
        await logout();
        setErrorMessage('Access Notice: This account has Administrator privileges. Please switch to the Administrator Portal tab.');
        return;
      }

      if (authenticatedUser.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/employee/dashboard', { replace: true });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Invalid credentials or connection error.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePortalSwitch = (portal) => {
    setActivePortal(portal);
    setEmail('');
    setPassword('');
    setErrorMessage('');
  };

  const handleQuickFill = (quickEmail, quickPassword) => {
    setEmail(quickEmail);
    setPassword(quickPassword);
    setErrorMessage('');
  };

  const isAdminPortal = activePortal === 'ADMIN';

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0b1329',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 'var(--space-4)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          padding: 'var(--space-8)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-5)' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              backgroundColor: isAdminPortal ? 'var(--primary-600)' : 'var(--color-info)',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 'var(--space-3)',
              transition: 'background-color var(--transition-fast)',
            }}
          >
            <Layers size={24} strokeWidth={2.2} />
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Enterprise TMS
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {isAdminPortal ? 'Administrator Management Portal' : 'Employee Operational Workspace'}
          </p>
        </div>

        {/* Separate Portal Selection Tabs (Requirement 5 Compliance) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            backgroundColor: 'var(--bg-subtle)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-6)',
          }}
        >
          <button
            type="button"
            onClick={() => handlePortalSwitch('ADMIN')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 12px',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              backgroundColor: isAdminPortal ? 'var(--bg-surface)' : 'transparent',
              color: isAdminPortal ? 'var(--primary-600)' : 'var(--text-muted)',
              boxShadow: isAdminPortal ? 'var(--shadow-xs)' : 'none',
              transition: 'all var(--transition-fast)',
            }}
          >
            <Shield size={15} />
            <span>Admin Portal</span>
          </button>

          <button
            type="button"
            onClick={() => handlePortalSwitch('EMPLOYEE')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 12px',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              backgroundColor: !isAdminPortal ? 'var(--bg-surface)' : 'transparent',
              color: !isAdminPortal ? 'var(--color-info)' : 'var(--text-muted)',
              boxShadow: !isAdminPortal ? 'var(--shadow-xs)' : 'none',
              transition: 'all var(--transition-fast)',
            }}
          >
            <User size={15} />
            <span>Employee Portal</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--color-danger-bg)',
              border: '1px solid var(--color-danger-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-danger)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: 'var(--space-4)',
            }}
            role="alert"
          >
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              {isAdminPortal ? 'Admin Email Address' : 'Employee Email Address'}
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                id="login-email"
                type="email"
                className="form-control"
                style={{ paddingLeft: 38 }}
                placeholder={isAdminPortal ? 'admin@enterprise.corp' : 'employee@enterprise.corp'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                id="login-password"
                type="password"
                className="form-control"
                style={{ paddingLeft: 38 }}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{
              width: '100%',
              marginTop: 'var(--space-2)',
              backgroundColor: isAdminPortal ? 'var(--primary-600)' : 'var(--color-info)',
            }}
            disabled={submitting}
          >
            {submitting ? 'Authenticating...' : `Sign In as ${isAdminPortal ? 'Administrator' : 'Employee'}`}
            {!submitting && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Enterprise Quick-Fill Credentials */}
        <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-5)', borderTop: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Quick-Fill {isAdminPortal ? 'Admin' : 'Employee'} Credentials:
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
            {isAdminPortal ? (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                onClick={() => handleQuickFill('admin@enterprise.corp', 'AdminPassword123!')}
              >
                <Shield size={14} color="var(--primary-600)" />
                <span>Admin: <strong>admin@enterprise.corp</strong></span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                  onClick={() => handleQuickFill('alex.chen@enterprise.corp', 'EmployeePassword123!')}
                >
                  <User size={14} color="var(--color-info)" />
                  <span>Developer: <strong>alex.chen@enterprise.corp</strong></span>
                </button>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                  onClick={() => handleQuickFill('maya.patel@enterprise.corp', 'EmployeePassword123!')}
                >
                  <User size={14} color="var(--color-info)" />
                  <span>Architect: <strong>maya.patel@enterprise.corp</strong></span>
                </button>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                  onClick={() => handleQuickFill('jordan.taylor@enterprise.corp', 'EmployeePassword123!')}
                >
                  <User size={14} color="var(--color-info)" />
                  <span>Engineer: <strong>jordan.taylor@enterprise.corp</strong></span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 'var(--space-4)', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.45)' }}>
        Enterprise Security &bull; Better Auth Session Protected &bull; Node.js & Mongoose
      </div>
    </div>
  );
}
