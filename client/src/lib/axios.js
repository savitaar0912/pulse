import axios from 'axios';
import { queryClient } from './queryClient';

const apiBase = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL: apiBase,
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let refreshQueue = [];

export const runRefresh = async () => {
  const { data } = await axios.post(
    `${apiBase}/auth/refresh`,
    {},
    { withCredentials: true, timeout: 15000 }
  );
  if (!data?.accessToken) throw new Error('No token');
  localStorage.setItem('accessToken', data.accessToken);
  api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
  return data.accessToken;
};

const clearSessionAndRedirect = () => {
  localStorage.removeItem('accessToken');
  queryClient.clear();
  // Import dynamically to avoid circular dependency
  import('../features/auth/store').then(({ useAuthStore }) => {
    useAuthStore.getState().clearAuth();
  });
  window.location.href = '/login';
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // Don't intercept the refresh call itself
    if (original.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      isRefreshing = true;

      try {
        const token = await runRefresh();
        refreshQueue.forEach(({ resolve }) => resolve(token));
        refreshQueue = [];
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch (err) {
        refreshQueue.forEach(({ reject }) => reject(err));
        refreshQueue = [];
        clearSessionAndRedirect();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;