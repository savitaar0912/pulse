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
    mutationFn: userAPI.followUser,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["profile", id] });
      toast.success("Followed");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Unable to Follow");
    },
  });
};

export const useUnfollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userAPI.unfollowUser,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["profile", id] });
      toast.success("Unfollowed");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Unable to Unfollow");
    },
  });
};
