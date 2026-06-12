import userImage from "../assets/user.png";

export default function Avatar({ src, username, size = "md" }) {
  const sizes = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-16 h-16 text-xl",
    xs: "w-6 h-6 text-xs",
  };

  return (
    <img
      src={src?.trim() ? src : userImage}
      alt={username || "User Avatar"}
      title={username}
      className={`${sizes[size]} rounded-full object-cover`}
    />
  );
}
