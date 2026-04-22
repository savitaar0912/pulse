import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../../../api/auth';
import { useAuthStore } from '../store';
import { queryClient } from '../../../lib/queryClient';

export const useLogin = () => {
    const { setAuth } = useAuthStore()
    const navigate = useNavigate()

    return useMutation({
        mutationFn: authApi.login,
        onSuccess: ({ user, accessToken }) => {
            setAuth(user, accessToken);
            navigate('/')
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Login Failed')
        }
    })
}

export const useRegister = () => {
    const { setAuth } = useAuthStore();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: authApi.register,
        onSuccess: ({ user, accessToken }) => {
            setAuth({ user, accessToken });
            navigate('/')
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Registration Failed')
        }
    })
}

export const useLogout = () => {
    const { clearAuth } = useAuthStore();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: authApi.logout,
        onSettled: () => {
            clearAuth();
            queryClient.clear();
            navigate('/login');
        }
    })
}

export const useCurrentUSer = () => {
    const { user } = useAuthStore()

    return useQuery({
        queryKey: ['me'],
        queryFn: () => authApi.getMe().then(r => r.user),
        initialData: user,
        enabled: !!localStorage.getItem('accessToken')
    })
}