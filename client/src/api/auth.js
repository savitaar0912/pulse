import api from "../lib/axios";

export const authAPI = {
    register: (data) => api.post('/auth/register', data).then(r => r.data),
    login: (data) => api.post('/auth/login', data).then(r => r.data),
    logout: () => api.post('/auth/logout').then(r => r.data),
    getMe: () => api.get('/auth/me').then(r => r.data),
}
