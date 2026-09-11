import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Menu,
  Bell,
  Search,
  CheckCheck,
  ChevronDown,
  CheckSquare,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js';

export function Header({ onToggleSidebar, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // Global search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef(null);

  // User menu state
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications?limit=10');
      if (Array.isArray(res.data)) {
        setNotifications(res.data);
        setUnreadCount(res.pagination?.unreadCount || 0);
      }
    } catch {
      // Non-blocking
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // Ignored
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Ignored
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await api.patch(`/notifications/${notif._id}/read`);
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        // Ignored
      }
    }
    setIsNotifOpen(false);
    if (notif.relatedTask?._id || notif.relatedTask) {
      const taskId = notif.relatedTask._id || notif.relatedTask;
      const targetPath =
        user?.role === 'ADMIN' ? `/admin/tasks/${taskId}` : `/employee/tasks/${taskId}`;
      navigate(targetPath);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (isAdmin) {
      navigate(`/admin/tasks?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate(`/employee/tasks?search=${encodeURIComponent(searchQuery.trim())}`);
    }
    setSearchQuery('');
  };

  return (
    <header
      style={{
        height: 'var(--header-height)',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.02)',
      }}
    >
      {/* Left Area: Mobile Menu + Module Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
          <Menu size={19} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#111827' }}>
            {title || (isAdmin ? 'Admin Console' : 'Employee Workspace')}
          </span>
        </div>
      </div>

      {/* Center Area: Enterprise Global Search */}
      <form
        onSubmit={handleSearchSubmit}
        ref={searchRef}
        className="header-search-form"
        style={{
          flex: '0 1 420px',
          margin: '0 16px',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: isSearchFocused ? '#FFFFFF' : '#F1F3F6',
            border: `1px solid ${isSearchFocused ? 'var(--primary-600)' : 'transparent'}`,
            borderRadius: 'var(--radius-xs)',
            padding: '0 10px',
            height: '32px',
            transition: 'all var(--transition-fast)',
            boxShadow: isSearchFocused ? '0 0 0 2px var(--primary-focus)' : 'none',
          }}
        >
          <Search size={14} color={isSearchFocused ? 'var(--primary-600)' : '#9CA3AF'} style={{ flexShrink: 0, marginRight: 8 }} />
          <input
            type="text"
            placeholder={isAdmin ? 'Search tasks, employees, records... (Enter to go)' : 'Search my tasks... (Enter to go)'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '0.82rem',
              color: 'var(--text-primary)',
              width: '100%',
              fontFamily: 'inherit',
            }}
          />
        </div>
      </form>

      {/* Right Area: Notifications + User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Quick link to Tasks/Employees for Admin */}
        {isAdmin && (
          <div className="header-quick-actions" style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => navigate('/admin/tasks')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', height: '28px', padding: '0 8px' }}
              title="All Tasks"
            >
              <CheckSquare size={13} style={{ marginRight: 4 }} />
              <span>Tasks</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/employees')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', height: '28px', padding: '0 8px' }}
              title="Employee Management"
            >
              <Users size={13} style={{ marginRight: 4 }} />
              <span>Employees</span>
            </button>
          </div>
        )}

        {/* Notifications Popover */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xs)',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              color: isNotifOpen ? 'var(--primary-600)' : '#4B5563',
              backgroundColor: isNotifOpen ? 'var(--primary-50)' : '#FFFFFF',
              transition: 'all var(--transition-fast)',
            }}
            title="Notification Center"
            aria-label="Notifications"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -3,
                  right: -3,
                  backgroundColor: 'var(--color-danger)',
                  color: '#FFFFFF',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  borderRadius: '9999px',
                  minWidth: 15,
                  height: 15,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 3px',
                  lineHeight: 1,
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div
              className="card"
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                width: 330,
                maxHeight: 400,
                boxShadow: 'var(--shadow-lg)',
                zIndex: 200,
                padding: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  padding: '10px 14px',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#F8FAFC',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#111827' }}>
                  Notifications {unreadCount > 0 && `(${unreadCount})`}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary-600)',
                      fontSize: '0.74rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: 600,
                      padding: 0,
                    }}
                  >
                    <CheckCheck size={13} />
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ overflowY: 'auto', maxHeight: 320 }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    No notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => handleNotificationClick(n)}
                      style={{
                        padding: '10px 14px',
                        borderBottom: '1px solid #F1F5F9',
                        backgroundColor: n.isRead ? '#FFFFFF' : '#F0F7FD',
                        cursor: 'pointer',
                        transition: 'background var(--transition-fast)',
                        position: 'relative',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = n.isRead ? '#FFFFFF' : '#F0F7FD'; }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <div style={{ fontWeight: n.isRead ? 500 : 700, fontSize: '0.82rem', color: '#111827' }}>
                          {n.title}
                        </div>
                        {!n.isRead && (
                          <button
                            type="button"
                            onClick={(e) => handleMarkAsRead(n._id, e)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--primary-600)',
                              cursor: 'pointer',
                              padding: 0,
                              fontSize: '0.7rem',
                            }}
                            title="Mark as read"
                          >
                            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--primary-600)', display: 'inline-block' }} />
                          </button>
                        )}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.35 }}>
                        {n.message}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Chip */}
        <div style={{ position: 'relative' }} ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 8px',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xs)',
              background: '#FFFFFF',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                backgroundColor: 'var(--primary-600)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.74rem',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="header-username">
              {user?.name || (isAdmin ? 'Admin' : 'Employee')}
            </span>
            <ChevronDown size={13} color="#9CA3AF" />
          </button>

          {isUserMenuOpen && (
            <div
              className="card"
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 6px)',
                width: 200,
                padding: '4px',
                zIndex: 200,
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '4px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#111827' }}>{user?.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
                <div style={{ marginTop: '4px' }}>
                  <span className={`badge ${isAdmin ? 'badge-role-admin' : 'badge-role-employee'}`} style={{ fontSize: '0.68rem' }}>
                    {user?.role}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => { setIsUserMenuOpen(false); logout(); navigate('/login'); }}
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', justifyContent: 'flex-start', border: 'none', color: 'var(--color-danger)' }}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .mobile-menu-btn {
            display: inline-flex !important;
          }
        }
        @media (max-width: 768px) {
          .header-search-form,
          .header-quick-actions,
          .header-username {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
