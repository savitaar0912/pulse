import axios from 'axios';
import { queryClient } from './queryClient';

const apiBase = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL: apiBase,
  withCredentials: true,
  timeout: 15000, // 15 second timeout — handles cold starts
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let refreshQueue = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      // If refresh already in progress, queue this request
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
        const { data } = await axios.post(
          `${apiBase}/auth/refresh`,
          {},
          { withCredentials: true, timeout: 15000 }
        );

        localStorage.setItem('accessToken', data.accessToken);
        api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;

        // Resolve all queued requests with new token
        refreshQueue.forEach(({ resolve }) => resolve(data.accessToken));
        refreshQueue = [];

        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (err) {
        // Only clear auth if refresh genuinely failed
        refreshQueue.forEach(({ reject }) => reject(err));
        refreshQueue = [];
        localStorage.removeItem('accessToken');
        queryClient.clear();
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;