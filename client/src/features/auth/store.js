import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthReady: false,      // has the app finished checking session?

  setAuth: (user, accessToken) => {
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    set({ user, isAuthReady: true });
  },

  clearAuth: () => {
    localStorage.removeItem('accessToken');
    set({ user: null, isAuthReady: true });
  },

  setAuthReady: () => set({ isAuthReady: true }),
}));