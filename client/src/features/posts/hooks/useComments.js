import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsAPI } from '../../../api/comments';
import toast from 'react-hot-toast';

export const useComments = (postId) => {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: () => commentsAPI.getComments(postId),
    enabled: !!postId,
  });
};

export const useAddComment = (postId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ content }) => commentsAPI.addComment({ postId, content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      toast.success('Comment added');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to add comment');
    },
  });
};

export const useDeleteComment = (postId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId }) => commentsAPI.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      toast.success('Comment deleted');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete comment');
    },
  });
};

export default useComments;
