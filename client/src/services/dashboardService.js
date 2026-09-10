import { api } from './api.js';

export const dashboardService = {
  async getAdminDashboard() {
    const response = await api.get('/api/dashboard/admin');
    return response.data;
  },

  async getEmployeeDashboard() {
    const response = await api.get('/api/dashboard/employee');
    return response.data;
  },
};
