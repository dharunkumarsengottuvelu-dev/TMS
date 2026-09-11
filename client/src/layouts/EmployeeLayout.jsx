import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar.jsx';
import { Header } from '../components/layout/Header.jsx';

const TITLE_MAP = {
  '/employee/dashboard': 'Dashboard',
  '/employee/tasks': 'My Tasks',
};

export function EmployeeLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const currentTitle = TITLE_MAP[location.pathname] || 'Task Details';

  return (
    <div className="app-container">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />
      <div className={`main-wrapper ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} title={currentTitle} />
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
