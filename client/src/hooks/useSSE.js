import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../features/auth/store';

export const useSSE = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('accessToken');
    const es = new EventSource(`/api/stream?token=${token}`);

    // Named event — must use addEventListener, not onmessage
    es.addEventListener('new_post', (e) => {
      const { post } = JSON.parse(e.data);
      queryClient.setQueryData(['feed'], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: [
            { ...old.pages[0], posts: [post, ...old.pages[0].posts] },
            ...old.pages.slice(1)
          ]
        };
      });
    });

    es.addEventListener('new_notification', () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    es.addEventListener('new_follow', () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    });

    es.onerror = () => {
      try { es.close(); } catch (e) {}
    };

    return () => {
      try { es.close(); } catch (e) {}
    };
  }, [user]);
};