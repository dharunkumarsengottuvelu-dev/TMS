import { api } from './api.js';

export const taskService = {
  async getTasks(params = {}) {
    const response = await api.get('/api/tasks', { params });
    return response;
  },

  async getTaskById(taskId) {
    const response = await api.get(`/api/tasks/${taskId}`);
    return response.data;
  },

  async createTask(taskData) {
    const response = await api.post('/api/tasks', taskData);
    return response.data;
  },

  async updateTaskStatus(taskId, status) {
    const response = await api.patch(`/api/tasks/${taskId}/status`, { status });
    return response.data;
  },

  async deleteTask(taskId) {
    const response = await api.delete(`/api/tasks/${taskId}`);
    return response.data;
  },
};
