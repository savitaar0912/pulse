import axios from 'axios';
import { queryClient } from './queryClient';
import { useAuthStore } from '../features/auth/store';

const apiBase = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL: apiBase,
  withCredentials: true,
});

// Attach token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Refresh queue & state
let isRefreshing = false;
let failedRefresh = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // If refresh already failed, ensure logout happened
    if (failedRefresh) {
      try {
        const logoutUrl = import.meta.env.VITE_API_URL
          ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api/auth/logout`
          : '/api/auth/logout';
        await axios.post(logoutUrl, {}, { withCredentials: true });
      } catch (e) {}
      localStorage.removeItem('accessToken');
      try { useAuthStore.getState().clearAuth(); } catch (e) {}
      try { queryClient.clear(); } catch (e) {}
      window.location.replace('/login');
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      // Clear UI state immediately so protected UI doesn't render while refresh in progress
      try { useAuthStore.getState().clearAuth(); } catch (e) {}
      try { queryClient.clear(); } catch (e) {}

      // If a refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh(async (token) => {
            try {
              original.headers.Authorization = `Bearer ${token}`;
              resolve(api(original));
            } catch (err) {
              reject(err);
            }
          });
        });
      }

      isRefreshing = true;
      try {
        const refreshUrl = import.meta.env.VITE_API_URL
          ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api/auth/refresh`
          : '/api/auth/refresh';

        const { data } = await axios.post(refreshUrl, {}, { withCredentials: true });

        // If refresh returned no token, treat as failure
        if (!data?.accessToken) throw new Error('No accessToken from refresh');

        localStorage.setItem('accessToken', data.accessToken);
        api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
        onRefreshed(data.accessToken);
        try { queryClient.invalidateQueries(); } catch (e) {}

        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (err) {
        failedRefresh = true;
        // attempt server-side logout to clear httpOnly cookie
        try {
          const logoutUrl = import.meta.env.VITE_API_URL
            ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api/auth/logout`
            : '/api/auth/logout';
          await axios.post(logoutUrl, {}, { withCredentials: true });
        } catch (e) {}
        localStorage.removeItem('accessToken');
        try { useAuthStore.getState().clearAuth(); } catch (e) {}
        try { queryClient.clear(); } catch (e) {}
        window.location.replace('/login');
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;