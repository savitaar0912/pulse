import { useState, useRef, useEffect } from "react";
import {
  useComments,
  useAddComment,
  useDeleteComment,
} from "../hooks/useComments";

import { Trash2 } from "lucide-react";
import Avatar from "../../../components/Avatar";
import { useAuthStore } from "../../auth/store";

export default function Comments({ postId, open }) {
  const { data, isLoading } = useComments(postId);
  const { mutate: addComment, isLoading: adding } = useAddComment(postId);
  const { mutate: deleteComment, isLoading: deleting } =
    useDeleteComment(postId);
  const [text, setText] = useState("");
  const inputRef = useRef(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (open) {
      // small timeout to wait for animation
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open]);

  const comments = data?.comments ?? [];

  const handleAdd = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    addComment({ content: text });
    setText("");
    const el = inputRef.current;
    if (el) {
      el.style.height = '0px';
      el.style.height = `${Math.min(el.scrollHeight, 400)}px`;
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleAdd} className="flex items-start gap-2">
        <textarea
          ref={inputRef}
          className="w-[520px] border-2 border-emerald-300 rounded px-3 py-2 text-sm shadow-md  overflow-hidden"
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onInput={() => {
            const el = inputRef.current;
            if (!el) return;
            el.style.height = '0px';
            el.style.height = `${Math.min(el.scrollHeight, Infinity)}px`;
          }}
          rows={1}
        />
        <button
          disabled={adding}
          className="bg-emerald-500 text-white px-3 py-1 rounded cursor-pointer"
        >
          Reply
        </button>
      </form>

      {isLoading ? (
        <p className="text-sm text-gray-400">Loading comments...</p>
      ) : (
        <div className="space-y-2 mb-2.5">
          {comments.length === 0 && (
            <p className="text-sm text-gray-400">No comments yet — be the first!</p>
          )}
          {comments.map((c) => (
            <div key={c._id} className="flex items-start gap-3">
              <Avatar src={c.userId?.avatarUrl} username={c.userId?.username} />
              <div className="bg-white rounded-xl p-5 shadow-md flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">
                      {c.userId?.displayName}
                    </div>
                    <div className="text-sm text-gray-700 ml-10">{c.content}</div>
                  </div>
                  <div>
                    {user && c.userId && c.userId._id === user._id && (
                      <button
                        onClick={() => deleteComment({ commentId: c._id })}
                        disabled={deleting}
                        className="ml-auto text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={16} className="cursor-pointer" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
