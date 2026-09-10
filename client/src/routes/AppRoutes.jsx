import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Auth
import { LoginPage } from '../pages/auth/LoginPage.jsx';
import { RoleRoute } from './RoleRoute.jsx';

// Layouts
import { AdminLayout } from '../layouts/AdminLayout.jsx';
import { EmployeeLayout } from '../layouts/EmployeeLayout.jsx';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard.jsx';
import { AdminTasksPage } from '../pages/admin/AdminTasksPage.jsx';
import { TaskDetailsPage } from '../pages/admin/TaskDetailsPage.jsx';
import { EmployeesPage } from '../pages/admin/EmployeesPage.jsx';
import { EmployeeDetailsPage } from '../pages/admin/EmployeeDetailsPage.jsx';
import { ReportsPage } from '../pages/admin/ReportsPage.jsx';
import { AuditLogsPage } from '../pages/admin/AuditLogsPage.jsx';

// Employee Pages
import { EmployeeDashboard } from '../pages/employee/EmployeeDashboard.jsx';
import { EmployeeTasksPage } from '../pages/employee/EmployeeTasksPage.jsx';
import { EmployeeTaskDetailsPage } from '../pages/employee/EmployeeTaskDetailsPage.jsx';

function IndexRedirect() {
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

  return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/employee/dashboard'} replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Root Route */}
      <Route path="/" element={<IndexRedirect />} />

      {/* Public Login Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Admin Protected Routes */}
      <Route element={<RoleRoute allowedRole="ADMIN" />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/tasks" element={<AdminTasksPage />} />
          <Route path="/admin/tasks/:id" element={<TaskDetailsPage />} />
          <Route path="/admin/employees" element={<EmployeesPage />} />
          <Route path="/admin/employees/:id" element={<EmployeeDetailsPage />} />
          <Route path="/admin/reports" element={<ReportsPage />} />
          <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
        </Route>
      </Route>

      {/* Employee Protected Routes */}
      <Route element={<RoleRoute allowedRole="EMPLOYEE" />}>
        <Route element={<EmployeeLayout />}>
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          <Route path="/employee/tasks" element={<EmployeeTasksPage />} />
          <Route path="/employee/tasks/:id" element={<EmployeeTaskDetailsPage />} />
        </Route>
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<IndexRedirect />} />
    </Routes>
  );
}
