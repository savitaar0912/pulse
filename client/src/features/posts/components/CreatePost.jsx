import { useState, useRef } from "react";
import { Image, X } from "lucide-react";
import { useAuthStore } from "../../auth/store";
import { useCreatePost } from "../hooks/usePosts";
import Avatar from "../../../components/Avatar";

export default function CreatePost() {
  const { user } = useAuthStore();
  const { mutate: createPost, isPending } = useCreatePost();
  const [content, setContent] = useState("");
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const fileRef = useRef();

  const handleImage = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = () => {
    if (!content.trim()) return;
    const formData = new FormData();
    formData.append("content", content);
    if (file) formData.append("image", file);
    createPost(formData, {
      onSuccess: () => {
        setContent("");
        setFile(null);
        setPreview(null);
      },
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
      <div className="flex gap-3">
        <Avatar src={user?.avatarUrl} username={user?.username} />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          maxLength={280}
          rows={3}
          className="flex-1 resize-none text-sm border-none outline-none"
        />
      </div>
      {preview && (
        <div className="relative">
          <img
            src={preview}
            className="rounded-xl w-full max-h-64 object-cover"
          />
          <button
            onClick={() => {
              setPreview(null);
              setFile(null);
            }}
            className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1"
          >
            <X size={14} />
          </button>
        </div>
      )}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => fileRef.current.click()}
          className="text-gray-400 hover:text-emerald-500"
        >
          <Image size={20} />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImage}
        />
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">{content.length}/280</span>
          <button
            onClick={handleSubmit}
            disabled={isPending || !content.trim()}
            className="bg-emerald-500 text-white text-sm font-semibold px-4 py-1.5 rounded-full hover:bg-emerald-600 disabled:opacity-50"
          >
            {isPending ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
