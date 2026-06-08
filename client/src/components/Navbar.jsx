import React from "react";
import { useAuthStore } from "../features/auth/store";
import Avatar from "./Avatar";
import { useLogout } from "../features/auth/hooks/useAuth";
import { Link } from "react-router-dom";
import NotificationsBell from "./NotificationsBell";

export default function Navbar() {
  const { user } = useAuthStore();
  const { mutate: handleLogout } = useLogout();

  return (
    <nav className="w-full relative flex items-center px-6 py-2 bg-white shadow min-h-[56px]">
      {/* Left: Logo */}
      <div className="flex items-center z-10">
        <Link to="/">
          <img
            src="/favicon.png"
            alt=""
            srcSet=""
            className="rounded-half h-[50px]"
          />
        </Link>
      </div>

      {/* Center: Search (absolute center) */}
      <div className="absolute left-1/2 -translate-x-1/2 flex justify-center w-[320px]">
        <input
          type="text"
          placeholder="Search User"
          className="bg-gray-100 rounded-full px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      {/* Right: User/Logout or Login */}
      <div className="flex items-center gap-4 ml-auto z-10">
        {user ? (
          <>
            <NotificationsBell />
            <Link to={`/${user.username}`}>
              <Avatar src={user.avatarUrl} username={user.username} />
            </Link>
            <button
              onClick={() => handleLogout()}
              className="text-emerald-600 font-semibold hover:underline cursor-pointer focus:outline-none"
              type="button"
            >
              Log Out
            </button>
          </>
        ) : (
          ""
        )}
      </div>
    </nav>
  );
}
