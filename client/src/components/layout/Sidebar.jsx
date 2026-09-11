import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  TrendingUp,
  ShieldAlert,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { TaskOpsLogo } from '../common/TaskOpsLogo.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export function Sidebar({ isOpen, onClose, collapsed, onToggleCollapse }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/employees', label: 'Employee Management', icon: Users },
    { to: '/admin/tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/admin/reports', label: 'Progress', icon: TrendingUp },
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: ShieldAlert },
  ];

  const employeeLinks = [
    { to: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/employee/tasks', label: 'My Tasks', icon: CheckSquare },
  ];

  const links = isAdmin ? adminLinks : employeeLinks;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            zIndex: 140,
            display: 'block',
          }}
          className="sidebar-backdrop"
        />
      )}

      <aside
        style={{
          width: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
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
          transition: 'width var(--transition-normal), transform var(--transition-normal)',
        }}
        className={`app-sidebar ${isOpen ? 'sidebar-open' : ''} ${collapsed ? 'collapsed' : ''}`}
      >
        {/* Brand Header */}
        <div
          style={{
            height: 'var(--header-height)',
            padding: collapsed ? '0 16px' : '0 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
            <TaskOpsLogo
              size={30}
              showText={!collapsed}
              textColor="light"
              subtitle={isAdmin ? 'Admin Console' : 'Employee Portal'}
            />
          </div>

          {/* Desktop collapse toggle or Mobile close */}
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
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav style={{ padding: collapsed ? '16px 8px' : '16px 12px', flex: 1, overflowY: 'auto' }}>
          {!collapsed && (
            <div
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#64748B',
                padding: '0 10px 10px',
              }}
            >
              Main Menu
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'collapsed' : ''}`}
                  title={collapsed ? link.label : undefined}
                >
                  <Icon size={17} strokeWidth={2} style={{ flexShrink: 0 }} />
                  {!collapsed && <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{link.label}</span>}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Bottom User / Actions Section */}
        <div
          style={{
            padding: collapsed ? '12px 8px' : '12px 14px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(0, 0, 0, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {/* Collapse Toggle Button for Desktop */}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="collapse-toggle-btn"
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#94A3B8',
                borderRadius: '4px',
                height: '28px',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                gap: '6px',
                fontSize: '0.75rem',
              }}
            >
              {collapsed ? <ChevronRight size={14} /> : <><ChevronLeft size={14} /> <span>Collapse</span></>}
            </button>
          )}

          {/* Profile row */}
          {!collapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: '2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-600)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#F1F5F9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.name || (isAdmin ? 'Admin' : 'Employee')}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.email}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                title="Sign Out"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color var(--transition-fast)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              title="Sign Out"
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; }}
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </aside>

      <style>{`
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border-radius: var(--radius-xs);
          color: #94A3B8;
          font-size: 0.85rem;
          font-weight: 500;
          text-decoration: none;
          transition: all var(--transition-fast);
          white-space: nowrap;
        }

        .sidebar-link.collapsed {
          justify-content: center;
          padding: 8px 0;
        }

        .sidebar-link:hover {
          background-color: var(--bg-sidebar-hover);
          color: #FFFFFF;
        }

        .sidebar-link.active {
          background-color: var(--primary-600);
          color: #FFFFFF;
          font-weight: 600;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        .collapse-toggle-btn:hover {
          background: rgba(255, 255, 255, 0.1) !important;
          color: #FFFFFF !important;
        }

        @media (max-width: 1024px) {
          .app-sidebar {
            transform: translateX(-100%);
            width: var(--sidebar-width) !important;
          }
          .app-sidebar.sidebar-open {
            transform: translateX(0);
          }
          .sidebar-close-btn {
            display: inline-flex !important;
          }
          .collapse-toggle-btn {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
