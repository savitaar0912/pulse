import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postAPI } from '../../../api/posts';
import toast from 'react-hot-toast';

export const useFeed = () => {
    return useInfiniteQuery({
        queryKey: ['feed'],
        queryFn: ({ pageParam }) => postAPI.getFeed(pageParam),
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        initialPageParam: undefined,
    })
}

export const useCreatePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: postAPI.createPost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['feed'] });
            toast.success('Posted!');
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to Post")
        },
    })
}

export const useDeletePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: postAPI.deletePost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['feed'] }),
                toast.success('Deleted')
        }
    })
}


export const useLikePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, isLiked }) => isLiked ? postAPI.unlikePost(id) : postAPI.likePost(id),
        onMutate: async ({ id, isLiked }) => {
            // Optimistic update — update UI before server responds
            await queryClient.cancelQueries({ queryKey: ['feed'] });
            const previous = queryClient.getQueryData(['feed']);

            queryClient.setQueryData(['feed'], (old) => ({
                ...old,
                pages: old.pages.map(page => ({
                    ...page,
                    posts: page.posts.map(post =>
                        post._id === id
                            ? {
                                ...post,
                                likesCount: post.likesCount + (isLiked ? -1 : 1),
                                isLiked: !isLiked
                            }
                            : post
                    ),
                })),
            }));

            return { previous };
        },
        onError: (err, vars, context) => {
            // Roll back if server rejects
            queryClient.setQueryData(['feed'], context.previous);
            toast.error('Something went wrong');
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: ['feed'] }),
    })
}
