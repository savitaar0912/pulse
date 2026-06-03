import { useRef, useCallback } from "react";
import { useFeed } from "../features/posts/hooks/usePosts";
import PostCard from "../components/PostCard";
import CreatePost from "../features/posts/components/CreatePost";
import { useSSE } from "../hooks/useSSE";

export default function FeedPage() {
  useSSE();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useFeed();

  // Infinite scroll — watch the last element, fetch more when it enters viewport
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
      <div className="space-y-4 max-w-xl mx-auto pt-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-sm p-4 animate-pulse space-y-3"
          >
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-48 bg-gray-200 rounded-xl" />
          </div>
        ))}
      </div>
    );

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  return (
    <div className="max-w-xl mx-auto pt-6 pb-20 space-y-4 px-4">
      <CreatePost />
      {posts.map((post, i) => (
        <div key={post._id} ref={i === posts.length - 1 ? lastPostRef : null}>
          <PostCard post={post} />
        </div>
      ))}
      {isFetchingNextPage && (
        <p className="text-center text-sm text-gray-400">Loading more...</p>
      )}
      {!hasNextPage && posts.length > 0 && (
        <p className="text-center text-sm text-gray-400">
          You're all caught up
        </p>
      )}
    </div>
  );
}
