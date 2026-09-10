import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function RoleRoute({ allowedRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== allowedRole) {
    const fallbackPath = user.role === 'ADMIN' ? '/admin/dashboard' : '/employee/dashboard';
    return <Navigate to={fallbackPath} replace />;
  }

  return <Outlet />;
}
