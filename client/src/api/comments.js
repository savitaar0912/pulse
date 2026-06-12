import api from '../lib/axios';

export const commentsAPI = {
  getComments: async (postId) => {
    const res = await api.get(`/posts/${postId}/comments`);
    return res.data;
  },

  addComment: async ({ postId, content }) => {
    const res = await api.post(`/posts/${postId}/comment`, { comment: content });
    return res.data;
  },

  deleteComment: async (commentId) => {
    const res = await api.delete(`/posts/comments/${commentId}`);
    return res.data;
  },
};

export default commentsAPI;
