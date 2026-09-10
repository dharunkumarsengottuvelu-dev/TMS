import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for consistent response data & error extraction
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred. Please try again.';
    const errors = error.response?.data?.errors || [];
    const statusCode = error.response?.status || 500;

    return Promise.reject({
      message,
      errors,
      statusCode,
      raw: error,
    });
  }
);
