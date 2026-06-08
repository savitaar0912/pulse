import { Heart, Trash2, MessageCircle } from "lucide-react";
import { useAuthStore } from "../features/auth/store";
import { useLikePost, useDeletePost } from "../features/posts/hooks/usePosts";
import Avatar from "./Avatar";
import { formatDistanceToNow } from "date-fns";

export default function PostCard({ post }) {
  const { user } = useAuthStore();
  const { mutate: toggleLike } = useLikePost();
  const { mutate: deletePost } = useDeletePost();

  const isOwner = user?._id === post.userId._id;
  const isLiked = post.isLiked;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Avatar src={post.userId.avatarUrl} username={post.userId.username} />
        <div>
          <p className="font-semibold text-sm">{post.userId.displayName}</p>
          <p className="text-gray-400 text-xs">
            @{post.userId.username} ·{" "}
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </p>
        </div>
        {isOwner && (
              <button
                onClick={() => deletePost({ id: post._id, ownerId: post.userId._id })}
                className="ml-auto text-gray-400 hover:text-red-500"
              >
                <Trash2 size={16} />
              </button>
            )}
      </div>

      <p className="text-sm leading-relaxed">{post.content}</p>

      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt="post"
          loading="lazy"
          className="rounded-xl w-full object-cover max-h-96"
        />
      )}

      <div className="flex items-center gap-4 pt-1">
        <button
          onClick={() => toggleLike({ id: post._id, isLiked, ownerId: post.userId._id })}
          className={`flex items-center gap-1 text-sm ${isLiked ? "text-red-500" : "text-gray-400 hover:text-red-500"}`}
        >
          <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
          {post.likesCount}
        </button>
        <span className="flex items-center gap-1 text-sm text-gray-400">
          <MessageCircle size={18} />
          {post.commentsCount}
        </span>
      </div>
    </div>
  );
}
