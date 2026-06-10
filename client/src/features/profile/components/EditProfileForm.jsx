import React, { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../../auth/store";
import Avatar from "../../../components/Avatar";
import { useEditProfile } from "../hooks/useProfile";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const schema = z.object({
  displayName: z.string().min(1, "Display name is required"),
  bio: z.string().max(160).optional(),
});

export default function EditProfileForm() {
  const { user } = useAuthStore();
  const { mutate: updateProfile, isPending } = useEditProfile()
  const navigate = useNavigate();

  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(() => user?.avatarUrl ?? null);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { displayName: user?.displayName ?? "", bio: user?.bio ?? "" },
  });

  useEffect(() => {
    if (!user) return;
    reset({ displayName: user.displayName ?? "", bio: user.bio ?? "" });
    const t = setTimeout(() => setPreview(user.avatarUrl ?? null), 0);
    return () => clearTimeout(t);
  }, [user, reset]);

  useEffect(() => {
    if (!avatarFile) return;
    const url = URL.createObjectURL(avatarFile);
    const t = setTimeout(() => setPreview(url), 0);
    return () => {
      clearTimeout(t);
      URL.revokeObjectURL(url);
    };
  }, [avatarFile]);

  const onSubmit = (values) => {
    const formData = new FormData();
    formData.append("displayName", values.displayName);
    if (values.bio) formData.append("bio", values.bio);
    if (avatarFile) formData.append("avatar", avatarFile);

    updateProfile(formData);
  };

  return (
    <div className="max-w-md mx-auto my-4 p-4 bg-white rounded-2xl shadow">
      <h2 className="text-lg text-center font-bold mb-4">Edit profile</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div
          className="flex flex-col items-center cursor-pointer"
          role="button"
          tabIndex={0}
          aria-label="Change avatar"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <Avatar src={preview} username={user?.username} size="lg" />
          <span className="mt-2 text-sm text-gray-600">Change avatar</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
            className="hidden"
          />
        </div>

        <label className="flex flex-col">
          <span className="text-sm font-medium">Display name</span>
          <input
            {...register("displayName")}
            className="mt-1 p-2 border rounded-md"
          />
          {errors.displayName && (
            <span className="text-sm text-red-500 mt-1">{errors.displayName.message}</span>
          )}
        </label>

        <label className="flex flex-col">
          <span className="text-sm font-medium">Bio</span>
          <textarea
            {...register("bio")}
            className="mt-1 p-2 border rounded-md"
            rows={4}
          />
          {errors.bio && (
            <span className="text-sm text-red-500 mt-1">{errors.bio.message}</span>
          )}
        </label>

        <div className="flex gap-2 justify-end">
          <button
            type="button"
            className="px-4 py-2 rounded-full border cursor-pointer"
            onClick={() => navigate(-1)}
            disabled={isPending || isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-full bg-emerald-500 text-white cursor-pointer"
            disabled={isPending || isSubmitting}
          >
            {isPending ? "Saving..." : "Update Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
