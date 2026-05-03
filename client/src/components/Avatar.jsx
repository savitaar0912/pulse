export default function Avatar({ src, userName, size = "md" }) {
  const sizes = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-16 h-16 text-xl",
  };
  if (src)
    return (
      <img
        src={src}
        alt={userName}
        className={`$sizes[size] rounded-full object-cover`}
      />
    );

  return (
    <div
      className={`${sizes[size]} rounded-full bg-blue-500 text-white flex items-center justify-center font-bold`}
    >
      {userName?.[0]?.toUpperCase()}
    </div>
  );
}
