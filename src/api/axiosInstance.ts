import axios from 'axios';
import { getToken, removeToken } from '../utils/storage';
import { message } from 'antd';

// Base API URL from .env
const baseURL = import.meta.env.VITE_API_URL;

// Create Axios instance
const axiosInstance = axios.create({
  baseURL,
  timeout: 20000, // 20s timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🧩 Request interceptor — attach token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Attach selected branch IDs
    const branchIds = localStorage.getItem('selectedBranchIds');
    if (branchIds) {
      config.headers['x-branch-ids'] = branchIds;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ⚠️ Response interceptor — handle global errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const isLoginEndpoint = error.config?.url?.includes('/login');

      // Unauthorized → log out (but not for login endpoint)
      if (status === 401 && !isLoginEndpoint) {
        message.error('Session expired. Please log in again.');
        removeToken();
        localStorage.removeItem('user');
        window.location.href = '/yamaha/login';
      }

      // Common 4xx/5xx handling (but not for login endpoint)
      if (status >= 400 && !isLoginEndpoint) {
        message.error(data?.message || 'Something went wrong');
      }
    } else if (error.request) {
      message.error('Network error. Please check your connection.');
    } else {
      message.error(error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
