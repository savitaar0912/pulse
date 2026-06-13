import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsAPI } from '../../../api/comments';
import toast from 'react-hot-toast';

const updatePostCommentsCount = (queryClient, postId, delta) => {
  const updateInfinitePosts = (old) => {
    if (!old?.pages) return old;

    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        posts: page.posts.map((post) =>
          post._id === postId
            ? {
                ...post,
                commentsCount: Math.max(0, (post.commentsCount ?? 0) + delta),
              }
            : post
        ),
      })),
    };
  };

  queryClient.setQueryData(['feed'], updateInfinitePosts);
  queryClient.setQueriesData({ queryKey: ['userPosts'] }, updateInfinitePosts);
};

const refreshPostCaches = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ['feed'] });
  queryClient.invalidateQueries({ queryKey: ['userPosts'] });
};

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
      updatePostCommentsCount(queryClient, postId, 1);
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      refreshPostCaches(queryClient);
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
      updatePostCommentsCount(queryClient, postId, -1);
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      refreshPostCaches(queryClient);
      toast.success('Comment deleted');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete comment');
    },
  });
};

export default useComments;
