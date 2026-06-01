import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { userAPI } from "../../../api/users";
import { toast } from "react-hot-toast";

// username comes from the URL — caller passes it in
export const useProfile = (username) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["profile", username], // each username gets its own cache bucket
    queryFn: () => userAPI.getProfile(username), // pass it to the API call
    enabled: !!username, // don't fetch if username is undefined
    onSuccess: (data) => {
      // also store the fetched profile under the canonical user id key
      const id = data?.user?._id;
      if (id) {
        queryClient.setQueryData(["profile", id], data);
      }
    },
  });
};

// userId comes from the profile we just loaded
export const useUserPosts = (userId) => {
  return useInfiniteQuery({
    queryKey: ["userPosts", userId], // each user's posts cached separately
    queryFn: ({ pageParam }) => userAPI.getUserPosts(userId, pageParam), // userId from closure
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined,
    enabled: !!userId, // don't fetch until we have a userId
  });
};

export const useFollowUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // toggle: if `isFollowing` true -> unfollow, else follow
    mutationFn: ({ id, isFollowing }) =>
      isFollowing ? userAPI.unfollowUser(id) : userAPI.followUser(id),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ["profile"] });

      // snapshot all profile queries so we can roll back
      const previous = queryClient.getQueriesData(["profile"]);

      // optimistic update: flip `isFollowed`/`isFollowing` and adjust counts
      previous.forEach(([qk, data]) => {
        if (!data) return;
        const user = data.user ?? data;
        if (!user || (user._id && user._id !== id && qk[1] !== id)) return;

        queryClient.setQueryData(qk, (old) => {
          const oldData = old ?? data;
          const u = oldData.user ?? oldData;
          const currentlyFollowing = u.isFollowing ?? u.isFollowed ?? false;
          const adjusted = {
            ...oldData,
            user: {
              ...u,
              isFollowing: !currentlyFollowing,
              followersCount:
                (u.followersCount || 0) + (currentlyFollowing ? -1 : 1),
            },
          };
          return adjusted;
        });
      });

      return { previous };
    },
    onError: (err, vars, context) => {
      // rollback all profile queries
      context?.previous?.forEach(([qk, data]) => {
        queryClient.setQueryData(qk, data);
      });
      toast.error(err.response?.data?.message || "Unable to toggle follow");
    },
    onSettled: (_, __, vars) => {
      // ensure fresh data for this profile
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      const id = vars?.id;
      if (id) {
        // also invalidate userPosts cache for that user
        queryClient.invalidateQueries({ queryKey: ["userPosts", id] });
      }
    },
  });
};

// export const useUnfollowUser = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: ({ id }) => userAPI.unfollowUser(id),
//     onSuccess: (_, { username }) => {
//       queryClient.setQueryData(['profile', username], (old) => ({
//         ...old,
//         user: {
//           ...old.user,
//           isFollowed: false,
//           followersCount: old.user.followersCount - 1
//         }
//       }));
//       toast.success('Unfollowed');
//     },
//     onError: (err) => toast.error(err.response?.data?.message || 'Unable to unfollow'),
//   });
// };
