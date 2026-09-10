import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { LogOut, Menu, Shield, User, Bell, CheckCheck, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js';

export function Header({ onToggleSidebar, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

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
    const interval = setInterval(fetchNotifications, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
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
    setIsOpen(false);
    if (notif.relatedTask?._id || notif.relatedTask) {
      const taskId = notif.relatedTask._id || notif.relatedTask;
      const targetPath =
        user?.role === 'ADMIN' ? `/admin/tasks/${taskId}` : `/employee/tasks/${taskId}`;
      navigate(targetPath);
    }
  };

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
        {/* In-App Notification Bell */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            style={{
              background: 'none',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '6px 10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              color: 'var(--text-secondary)',
            }}
            title="Notification Center"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  backgroundColor: 'var(--danger-500)',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  borderRadius: '9999px',
                  minWidth: 16,
                  height: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {isOpen && (
            <div
              className="card"
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                width: 340,
                maxHeight: 420,
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
                  padding: 'var(--space-3) var(--space-4)',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'var(--bg-muted)',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                  Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '0.75rem',
                      color: 'var(--primary-600)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontWeight: 500,
                    }}
                  >
                    <CheckCheck size={14} /> Mark all read
                  </button>
                )}
              </div>

              <div style={{ overflowY: 'auto', flex: 1, maxHeight: 340 }}>
                {notifications.length === 0 ? (
                  <div
                    style={{
                      padding: 'var(--space-6)',
                      textAlign: 'center',
                      color: 'var(--text-muted)',
                      fontSize: '0.85rem',
                    }}
                  >
                    No notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => handleNotificationClick(notif)}
                      style={{
                        padding: 'var(--space-3) var(--space-4)',
                        borderBottom: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        backgroundColor: notif.isRead ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-muted)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = notif.isRead
                          ? 'transparent'
                          : 'rgba(59, 130, 246, 0.05)';
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: 'var(--space-2)',
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                          {notif.title}
                        </div>
                        {!notif.isRead && (
                          <button
                            type="button"
                            onClick={(e) => handleMarkAsRead(notif._id, e)}
                            title="Mark as read"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--primary-600)',
                              cursor: 'pointer',
                              padding: 0,
                            }}
                          >
                            <CheckCheck size={14} />
                          </button>
                        )}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                        {notif.message}
                      </div>
                      <div
                        style={{
                          fontSize: '0.7rem',
                          color: 'var(--text-muted)',
                          marginTop: 4,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        {new Date(notif.createdAt).toLocaleDateString()} at{' '}
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {notif.relatedTask && <ExternalLink size={10} />}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User profile & Sign Out */}
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
