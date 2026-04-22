// This interceptor is the JWT refresh rotation in practice. When a request gets a 401 (token expired), it automatically tries to refresh once using the httpOnly cookie, then retries the original request. If refresh also fails, it logs the user out. You'll never have to think about this again — every API call goes through it.

import axios from 'axios';
import { queryClient } from './queryClient';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,        // send cookies on every request
});

// Attach access token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If 401, try to refresh once, then log out
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { data } = await axios.post('/api/auth/refresh', {}, {
          withCredentials: true,
        });
        localStorage.setItem('accessToken', data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        localStorage.removeItem('accessToken');
        queryClient.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;