import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Users, Layers, X, BarChart2, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/tasks', label: 'Task Management', icon: CheckSquare },
    { to: '/admin/employees', label: 'Employees Directory', icon: Users },
    { to: '/admin/reports', label: 'Executive Reports', icon: BarChart2 },
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: Shield },
  ];

  const employeeLinks = [
    { to: '/employee/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { to: '/employee/tasks', label: 'My Assigned Tasks', icon: CheckSquare },
  ];

  const links = isAdmin ? adminLinks : employeeLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 140,
            display: 'block',
          }}
          className="sidebar-backdrop"
        />
      )}

      <aside
        style={{
          width: 'var(--sidebar-width)',
          backgroundColor: 'var(--bg-sidebar)',
          color: 'var(--text-inverted)',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 150,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-md)',
          transition: 'transform var(--transition-normal)',
        }}
        className={`app-sidebar ${isOpen ? 'sidebar-open' : ''}`}
      >
        {/* Brand Header */}
        <div
          style={{
            height: 'var(--header-height)',
            padding: '0 var(--space-6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Layers size={18} strokeWidth={2.2} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '-0.01em' }}>
                ENTERPRISE TMS
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-inverted-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {isAdmin ? 'ADMIN CONSOLE' : 'EMPLOYEE PORTAL'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-inverted-muted)',
              cursor: 'pointer',
              display: 'none',
            }}
            className="sidebar-close-btn"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav style={{ padding: 'var(--space-6) var(--space-3)', flex: 1, overflowY: 'auto' }}>
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-inverted-muted)',
              padding: '0 var(--space-3) var(--space-3)',
            }}
          >
            Menu
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={18} strokeWidth={1.8} />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Footer info */}
        <div
          style={{
            padding: 'var(--space-4) var(--space-6)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(0, 0, 0, 0.15)',
          }}
        >
          <div style={{ fontSize: '0.78rem', color: 'var(--text-inverted-muted)' }}>
            Signed in as:
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {user?.email}
          </div>
        </div>
      </aside>

      <style>{`
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          color: #94a3b8;
          font-size: 0.9rem;
          font-weight: 500;
          text-decoration: none;
          transition: all var(--transition-fast);
        }

        .sidebar-link:hover {
          background-color: var(--bg-sidebar-hover);
          color: #ffffff;
        }

        .sidebar-link.active {
          background-color: var(--primary-600);
          color: #ffffff;
          font-weight: 600;
        }

        @media (max-width: 1024px) {
          .app-sidebar {
            transform: translateX(-100%);
          }
          .app-sidebar.sidebar-open {
            transform: translateX(0);
          }
          .sidebar-close-btn {
            display: inline-flex !important;
          }
        }
      `}</style>
    </>
  );
}
