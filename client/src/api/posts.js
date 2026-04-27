import api from '../lib/axios';

export const postAPI = {

    createPost: async (formData) => {
        const res = await api.post('/posts', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
    },

    getFeed: async (pageParam) => {
        const res = await api.get('/posts/feed', {
            params: { cursor: pageParam, limit: 10 }
        });
        return res.data;
    },

    getPost: async (id) => {
        const res = await api.get(`/posts/${id}`);
        return res.data;
    },

    deletePost: async (id) => {
        const res = await api.delete(`/posts/${id}`);
        return res.data;
    },

    likePost: async (id) => {
        const res = await api.post(`/posts/${id}/like`);
        return res.data;
    },

    unlikePost: async (id) => {
        const res = await api.delete(`/posts/${id}/like`);
        return res.data;
    }

};