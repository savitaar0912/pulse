import { useParams, Link } from "react-router-dom";
import {
  useProfile,
  useUserPosts,
  useFollowUser,
} from "../features/profile/hooks/useProfile";
import { useAuthStore } from "../features/auth/store";
import { useRef, useCallback } from "react";
import Avatar from "../components/Avatar";
import PostCard from "../components/PostCard";
// no direct react-query client needed here; mutations handle invalidation

export default function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser } = useAuthStore();
  const { data: profileData, isLoading } = useProfile(username);
  const user = profileData?.user;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useUserPosts(
    user?._id,
  );
  const { mutate: toggleFollow, isPending: toggling } = useFollowUser();
  // infinite scroll — same pattern as FeedPage
  const observer = useRef();

  const lastPostRef = useCallback(
    (node) => {
      if (isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) fetchNextPage();
      });
      if (node) observer.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage],
  );

  if (isLoading)
    return (
      <div className="max-w-xl mx-auto pt-10 px-4 animate-pulse space-y-4">
        <div className="flex gap-4 items-center">
          <div className="w-20 h-20 rounded-full bg-gray-200" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-3 bg-gray-200 rounded w-1/4" />
          </div>
        </div>
        <div className="h-3 bg-gray-200 rounded w-2/3" />
      </div>
    );

  if (!user)
    return (
      <div className="max-w-xl mx-auto pt-20 text-center text-gray-400">
        User not found.
      </div>
    );

  const isOwnProfile = currentUser?._id === user._id;
  const isFollowing = user.isFollowing ?? user.isFollowed ?? false;

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  return (
    <div className="max-w-xl mx-auto pt-6 pb-20 px-4 space-y-6">
      {/* Profile header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-4">
          <Avatar src={user.avatarUrl} username={user.username} size="lg" />
          <div className="flex-1">
            <h1 className="text-xl font-bold">{user.displayName}</h1>
            <p className="text-gray-400 text-sm">@{user.username}</p>
          </div>
          {isOwnProfile ? (
            <Link
              to="/settings"
              className="text-sm border border-gray-300 px-4 py-1.5 rounded-full hover:bg-gray-50"
            >
              Edit profile
            </Link>
          ) : (
            <button
              onClick={() => toggleFollow({ id: user._id, isFollowing })}
              disabled={toggling}
              className={`text-sm px-4 py-1.5 rounded-full font-semibold transition cursor-pointer
                ${
                  isFollowing
                    ? "border border-gray-300 hover:border-red-400 hover:text-red-500"
                    : "bg-black text-white hover:bg-gray-800"
                } disabled:opacity-50`}
              aria-label={isFollowing ? 'Unfollow' : 'Follow'}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          )}
        </div>

        {user.bio && <p className="text-sm text-gray-700">{user.bio}</p>}

        <div className="flex gap-6 text-sm">
          <span>
            <strong>{user.postsCount}</strong>{" "}
            <span className="text-gray-400">posts</span>
          </span>
          <span>
            <strong>{user.followersCount}</strong>{" "}
            <span className="text-gray-400">followers</span>
          </span>
          <span>
            <strong>{user.followingCount}</strong>{" "}
            <span className="text-gray-400">following</span>
          </span>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {posts.length === 0 && (
          <p className="text-center text-gray-400 text-sm pt-6">
            {isFollowing ? " No posts yet." : " Account is Private"}
          </p>
        )}
        {posts.map((post, i) => (
          <div key={post._id} ref={i === posts.length - 1 ? lastPostRef : null}>
            <PostCard post={post} />
          </div>
        ))}
        {isFetchingNextPage && (
          <p className="text-center text-sm text-gray-400">Loading more...</p>
        )}
      </div>
    </div>
  );
}
