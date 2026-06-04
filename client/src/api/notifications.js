import api from "../lib/axios";

export const notificationAPI = {
     getNotifications: async (data) => {
        const res = await api.get('/notification', data);
        return res.data;
    },

    markRead: async (data) => {
        const res = await api.put('/notification/read', data);
        return res.data;
    }
}