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
        mutationFn: ({ id }) => postAPI.deletePost(id),
        // Optimistic removal from relevant caches (feed + userPosts)
        onMutate: async ({ id, ownerId }) => {
            await queryClient.cancelQueries({ queryKey: ['feed'] });
            await queryClient.cancelQueries({ queryKey: ['userPosts', ownerId] });

            const previousFeed = queryClient.getQueryData(['feed']);
            const previousUserPosts = queryClient.getQueryData(['userPosts', ownerId]);
            const previousProfile = queryClient.getQueryData(['profile', ownerId]);

            // remove from feed pages
            queryClient.setQueryData(['feed'], (old) => {
                if (!old) return old;
                return {
                    ...old,
                    pages: old.pages.map(page => ({
                        ...page,
                        posts: page.posts.filter(p => p._id !== id),
                    })),
                };
            });

            // remove from this user's userPosts cache
            if (previousUserPosts) {
                queryClient.setQueryData(['userPosts', ownerId], (old) => {
                    if (!old) return old;
                    return {
                        ...old,
                        pages: old.pages.map(page => ({
                            ...page,
                            posts: page.posts.filter(p => p._id !== id),
                        })),
                    };
                });
            }

            // decrement profile postsCount if present
            if (previousProfile) {
                queryClient.setQueryData(['profile', ownerId], (old) => {
                    if (!old) return old;
                    const user = old.user ?? old;
                    return {
                        ...old,
                        user: {
                            ...user,
                            postsCount: Math.max(0, (user.postsCount || 0) - 1),
                        },
                    };
                });
            }

            return { previousFeed, previousUserPosts, previousProfile };
        },
        onError: (err, vars, context) => {
            // rollback
            if (context?.previousFeed) queryClient.setQueryData(['feed'], context.previousFeed);
            if (context?.previousUserPosts) queryClient.setQueryData(['userPosts', vars.ownerId], context.previousUserPosts);
            if (context?.previousProfile) queryClient.setQueryData(['profile', vars.ownerId], context.previousProfile);
            toast.error('Failed to delete');
        },
        onSettled: (_, __, vars) => {
            queryClient.invalidateQueries({ queryKey: ['feed'] });
            if (vars?.ownerId) {
                queryClient.invalidateQueries({ queryKey: ['userPosts', vars.ownerId] });
                queryClient.invalidateQueries({ queryKey: ['profile', vars.ownerId] });
            } else {
                queryClient.invalidateQueries({ queryKey: ['userPosts'] });
            }
            toast.success('Deleted');
        }
    })
}


export const useLikePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, isLiked, ownerId }) => isLiked ? postAPI.unlikePost(id) : postAPI.likePost(id),
        onMutate: async ({ id, isLiked, ownerId }) => {
            // Optimistic update — update UI before server responds
            await queryClient.cancelQueries({ queryKey: ['feed'] });
            const previous = queryClient.getQueryData(['feed']);

            // update feed
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

            // update userPosts for owner if present
            if (ownerId) {
                const prevUserPosts = queryClient.getQueryData(['userPosts', ownerId]);
                if (prevUserPosts) {
                    queryClient.setQueryData(['userPosts', ownerId], (old) => ({
                        ...old,
                        pages: old.pages.map(page => ({
                            ...page,
                            posts: page.posts.map(post =>
                                post._id === id
                                    ? {
                                        ...post,
                                        likesCount: post.likesCount + (isLiked ? -1 : 1),
                                        isLiked: !isLiked,
                                    }
                                    : post
                            ),
                        })),
                    }));
                }
            }

            return { previous };
        },
        onError: (err, vars, context) => {
            // Roll back if server rejects
            queryClient.setQueryData(['feed'], context.previous);
            toast.error('Something went wrong');
        },
        onSettled: (_, __, vars) => {
            queryClient.invalidateQueries({ queryKey: ['feed'] });
            if (vars?.ownerId) queryClient.invalidateQueries({ queryKey: ['userPosts', vars.ownerId] });
        },
    })
}
