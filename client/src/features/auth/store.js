import { create } from 'zustand'
import { persist } from 'zustand/middleware';

// create makes the store. set updates state. persist is a middleware that automatically saves to localStorage — so if you refresh the page, the user is still there. partialize controls what gets persisted — you're only saving user, not the access token (the token lives in localStorage separately, managed manually so the interceptor can access it).

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            setAuth: (user, accessToken) => {
                localStorage.setItem('accessToken', accessToken),
                    set({ user, accessToken })
            },
            clearAuth: () => {
                localStorage.removeItem('accessToken'),
                    set({ user: null, accessToken: null });
            },
        }),
        {
            name: 'pulse',
            partialize: (state) => ({ user: state.user }),  // only persist user, not token
        }
    )
)