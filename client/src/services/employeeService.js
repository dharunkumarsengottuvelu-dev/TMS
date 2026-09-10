import { api } from './api.js';

export const employeeService = {
  async getEmployees(params = {}) {
    return api.get('/api/employees', { params });
  },

  async getDepartments() {
    return api.get('/api/employees/departments');
  },

  async getEmployeeById(employeeId) {
    return api.get(`/api/employees/${employeeId}`);
  },

  async createEmployee(data) {
    return api.post('/api/employees', data);
  },

  async updateEmployee(employeeId, data) {
    return api.patch(`/api/employees/${employeeId}`, data);
  },

  async updateEmployeeStatus(employeeId, isActive) {
    return api.patch(`/api/employees/${employeeId}/status`, { isActive });
  },

  async resendInvitation(employeeId) {
    return api.post(`/api/employees/${employeeId}/resend-invitation`);
  },
};
