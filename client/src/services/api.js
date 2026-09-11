import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor ensuring standard /api prefix routing
api.interceptors.request.use((config) => {
  if (config.url && !config.url.startsWith('/api') && !config.url.startsWith('http')) {
    config.url = `/api${config.url.startsWith('/') ? '' : '/'}${config.url}`;
  }
  return config;
});

// Response interceptor for consistent response data & error extraction
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const statusCode = error.response?.status || 500;
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred. Please try again.';
    const errors = error.response?.data?.errors || [];

    // If session expired or unauthorized on protected routes, redirect to login
    if (statusCode === 401 && typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }

    return Promise.reject({
      message,
      errors,
      statusCode,
      raw: error,
    });
  }
);

export default api;
