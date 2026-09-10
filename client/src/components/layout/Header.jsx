import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { LogOut, Menu, Shield, User } from 'lucide-react';

export function Header({ onToggleSidebar, title }) {
  const { user, logout } = useAuth();

  return (
    <header
      style={{
        height: 'var(--header-height)',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-6)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <button
          type="button"
          onClick={onToggleSidebar}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px',
            color: 'var(--text-primary)',
          }}
          className="mobile-menu-btn"
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>
          {title || 'Enterprise Portal'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: user?.role === 'ADMIN' ? '#e0e7ff' : '#f1f5f9',
              color: user?.role === 'ADMIN' ? 'var(--primary-600)' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {user?.role === 'ADMIN' ? <Shield size={16} /> : <User size={16} />}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 600, lineHeight: 1.2 }}>
              {user?.name || 'User'}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {user?.role}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={logout}
          title="Sign out of system"
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .mobile-menu-btn {
            display: inline-flex !important;
          }
        }
      `}</style>
    </header>
  );
}
