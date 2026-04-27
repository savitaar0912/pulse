import api from "../lib/axios";

export const userAPI = {
    getProfile: async (username) => {
        const res = await api.get(`/users/${username}`);
        return res.data;
    },

    editProfile: async (formData) => {
        const res = await api.put(`/users/me`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data;
    },

    getUserPosts: async (id, pageParam) => {
        const res = await api.get(`/users/${id}/posts`, {
            params: { cursor: pageParam, limit: 10 },
        });
        return res.data;
    },

    searchUsers: async (query) => {
        const res = await api.get(`/users/search`, {
            params: { q: query },
        });
        return res.data;
    },

    followUser: async (id) => {
        const res = await api.post(`/users/${id}/follow`);
        return res.data;
    },

    unfollowUser: async (id) => {
        const res = await api.delete(`/users/${id}/follow`);
        return res.data;
    },
};