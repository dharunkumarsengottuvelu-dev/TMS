import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Lock, Mail, AlertCircle, Eye, EyeOff, ArrowRight } from 'lucide-react';

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // If already authenticated, redirect to role-specific dashboard
  if (user) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/employee/dashboard'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');
      const authenticatedUser = await login({ email: email.trim(), password });

      // Automatically route based on user role from database
      if (authenticatedUser.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/employee/dashboard', { replace: true });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Invalid credentials. Please check your email and password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F7F8FA',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px 16px',
        fontFamily: 'var(--font-family)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.03)',
          border: '1px solid var(--border-subtle)',
          padding: '32px 28px',
        }}
      >
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '8px',
              backgroundColor: 'var(--primary-600)',
              color: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
              fontWeight: 800,
              fontSize: '1.25rem',
              letterSpacing: '-0.02em',
              boxShadow: '0 2px 8px rgba(35, 109, 180, 0.3)',
            }}
          >
            TF
          </div>
          <h1
            style={{
              fontSize: '1.4rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: '#111827',
              margin: '0 0 4px',
            }}
          >
            TaskFlow
          </h1>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
            Sign in to your enterprise workspace
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            className="alert alert-error"
            style={{ marginBottom: '16px', fontSize: '0.8rem' }}
            role="alert"
          >
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              Email Address / Username
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={15}
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                id="login-email"
                type="email"
                className="form-control"
                style={{ paddingLeft: 34 }}
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <label className="form-label" htmlFor="login-password" style={{ margin: 0 }}>
                Password
              </label>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary-600)', cursor: 'pointer' }} onClick={() => alert('Please contact your administrator to reset your password.')}>
                Forgot password?
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock
                size={15}
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                style={{ paddingLeft: 34, paddingRight: 36 }}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', marginTop: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#4B5563', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: 'var(--primary-600)', cursor: 'pointer' }}
              />
              Remember me
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              height: '38px',
              fontSize: '0.88rem',
              fontWeight: 600,
            }}
            disabled={submitting}
          >
            {submitting ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Log In</span>
                <ArrowRight size={14} style={{ marginLeft: 2 }} />
              </>
            )}
          </button>
        </form>

        {/* Enterprise security note */}
        <div
          style={{
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)',
            textAlign: 'center',
            fontSize: '0.74rem',
            color: 'var(--text-muted)',
          }}
        >
          Protected by TaskFlow Enterprise Role-Based Access Control
        </div>
      </div>

      <div style={{ marginTop: '16px', fontSize: '0.74rem', color: '#9CA3AF' }}>
        &copy; {new Date().getFullYear()} TaskFlow Systems. All rights reserved.
      </div>
    </div>
  );
}
