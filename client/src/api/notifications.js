import api from "../lib/axios";

export const notificationAPI = {
    getNotifications: async () => {
        const res = await api.get('/notification');
        return res.data;
    },

    markRead: async (data) => {
        // server reads req.userId from auth middleware, no body required for mark-all-read
        const res = await api.put('/notification/read', data ?? {});
        return res.data;
    }
}