import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { userAPI } from "../../../api/users";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../auth/store";

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

export const useEditProfile = () => {
  const queryClient = useQueryClient();
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (formData) => userAPI.editProfile(formData),
    onSuccess: async (res) => {
      // server returns { user }
      const updated = res?.user ?? res;

      // 1) invalidate the profile cache for the updated username
      if (updated?.username) {
        queryClient.invalidateQueries({ queryKey: ["profile", updated.username] });
      }

      // 2) update the persisted auth state with the updated user
      const accessToken = localStorage.getItem("accessToken");
      await setAuth(updated, accessToken);

      toast.success("Profile updated");
      if (updated?.username) navigate(`/${updated.username}`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Update failed");
    },
  });
};
