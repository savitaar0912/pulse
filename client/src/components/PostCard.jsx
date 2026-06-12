import { Heart, Trash2, MessageCircle } from "lucide-react";
import { useState } from "react";
import Comments from "../features/posts/components/Comments";
import { useAuthStore } from "../features/auth/store";
import { useLikePost, useDeletePost } from "../features/posts/hooks/usePosts";
import Avatar from "./Avatar";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import ConfirmModal from "./ConfirmModal";

export default function PostCard({ post }) {
  const [showComments, setShowComments] = useState(false);
  const { user } = useAuthStore();
  const { mutate: toggleLike } = useLikePost();
  const { mutate: deletePost } = useDeletePost();

  const isOwner = user?._id === post.userId._id;
  const isLiked = post.isLiked;
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
      <div className="flex items-center gap-3 pt-2.5 pr-2.5 pb-2.5 pl-0">
        <Link to={`/${post.userId.username}`} className="flex items-center gap-3">
          <Avatar src={post.userId.avatarUrl} username={post.userId.username} />
          <div>
            <p className="font-semibold text-sm">{post.userId.displayName}</p>
            <p className="text-gray-400 text-xs">
              @{post.userId.username} ·{" "}
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </Link>
        {isOwner && (
          <>
            <button
              onClick={() => setShowConfirm(true)}
              className="ml-auto text-gray-400 hover:text-red-500 cursor-pointer"
            >
              <Trash2 size={16} />
            </button>

            <ConfirmModal
              open={showConfirm}
              title="Delete post"
              description="This action will permanently delete the post. Are you sure you want to continue?"
              onCancel={() => setShowConfirm(false)}
              onConfirm={() => {
                setShowConfirm(false);
                deletePost({ id: post._id, ownerId: post.userId._id });
              }}
            />
          </>
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
          onClick={() =>
            toggleLike({ id: post._id, isLiked, ownerId: post.userId._id })
          }
          className={`flex items-center gap-1 text-sm ${isLiked ? "text-red-500" : "text-gray-400 hover:text-red-500"}`}
        >
          <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
          {post.likesCount}
        </button>
        <button
          onClick={() => setShowComments((s) => !s)}
          className="flex items-center gap-1 text-sm text-gray-400"
        >
          <MessageCircle size={18} />
          {post.commentsCount}
        </button>
      </div>
      <div
        className={`pt-2 overflow-hidden transition-all duration-300 ${
          showComments ? "max-h-[48rem] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <Comments postId={post._id} open={showComments} />
      </div>
    </div>
  );
}
