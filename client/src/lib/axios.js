import axios from 'axios';
import { queryClient } from './queryClient';

const apiBase = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL: apiBase,
  withCredentials: true,
});

// Every time your app calls any API endpoint — posts, feed, profile, anything — this runs first. It reads the token from localStorage and attaches it to the request header. You never have to manually add the token in your API calls. It's automatic.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If 401, try to refresh once, then log out.
// The !original._retry flag is subtle but critical. Without it: request fails with 401 → interceptor tries to refresh → refresh also fails with 401 → interceptor tries to refresh again → infinite loop. The flag ensures we only attempt the refresh once.

api.interceptors.response.use(
  (res) => res,                           // success: just pass through
  async (error) => {                      // failure: here's where it gets interesting
    const original = error.config;       // the original request that failed
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;               // flag it so we don't infinite loop
      try {
        const { data } = await axios.post('/api/auth/refresh', {}, {
          withCredentials: true,              // send the httpOnly cookie
        });
        localStorage.setItem('accessToken', data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);                     // retry the original request
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