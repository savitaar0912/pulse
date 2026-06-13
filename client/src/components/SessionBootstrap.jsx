import { useEffect, useRef } from 'react';
import { useAuthStore } from '../features/auth/store';
import { runRefresh } from '../lib/axios.js';
import { authAPI } from '../api/auth.js';

export default function SessionBootstrap({ children }) {
  const { setAuth, clearAuth, isAuthReady } = useAuthStore();
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    const bootstrap = async () => {
      const token = localStorage.getItem('accessToken');

      try {
        if (!token) {
          // No access token — try to restore from refresh cookie
          const newToken = await runRefresh();
          // Refresh worked — fetch user
          const { user } = await authAPI.getMe();
          setAuth(user, newToken);
        } else {
          // Token exists — verify it's still valid
          const { user } = await authAPI.getMe();
          setAuth(user, token);
        }
      } catch {
        // Both failed — no valid session
        clearAuth();
      }
    };

    bootstrap();
  }, []);

  // Block rendering until we know auth state
  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return children;
}