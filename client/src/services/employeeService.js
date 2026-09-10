import { api } from './api.js';

export const employeeService = {
  async getEmployees(params = {}) {
    const response = await api.get('/api/employees', { params });
    return response;
  },

  async getEmployeeById(employeeId) {
    const response = await api.get(`/api/employees/${employeeId}`);
    return response.data;
  },
};
