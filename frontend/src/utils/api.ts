import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const requestUrl = error.config?.url || '';
      
      const isLoginPage = currentPath === '/login' || currentPath.startsWith('/login');
      const isRegisterPage = currentPath === '/register' || currentPath.startsWith('/register');
      const isChangePassword = requestUrl.includes('/users/change-password');
      
      // Don't redirect for:
      // 1. Login/register pages (let them handle auth errors)
      // 2. Change password endpoint (wrong current password should show error, not redirect)
      if (!isLoginPage && !isRegisterPage && !isChangePassword) {
        // Unauthorized - clear auth and redirect to login
        // This handles expired tokens, unauthorized access, etc.
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
      // For login/register/change-password, just reject the error so the page can handle it
    }
    return Promise.reject(error);
  }
);

export default api;

