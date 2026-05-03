import React from "react";
import { useAuthStore } from "../features/auth/store";
import Avatar from "./Avatar";
import { useLogout } from "../features/auth/hooks/useAuth";
import { Link } from "react-router-dom";

export default function Navbar() {
  const { user } = useAuthStore();
  const { mutate: handleLogout } = useLogout();

  return (
    <nav className="w-full flex items-center justify-between px-6 py-2 bg-white shadow">
      {/* Left: Logo */}
      <div className="flex items-center">
        <Link to="/" className="">
          <span className="rounded-full bg-green-500 text-white px-4 py-2 font-bold text-lg shadow-md">
            Pulse
          </span>
        </Link>
      </div>

      {/* Center: Search  */}
      <div className="flex justify-center">
        <input
          type="text"
          placeholder="Search User"
          className="bg-gray-100 rounded-full px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>

      {/* Right: User/Logout or Login */}
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link to={`/${user.username}`}>
              <Avatar src={user.avatarUrl} userName={user.username} />
            </Link>
            <button
              onClick={() => handleLogout()}
              className="text-green-600 font-semibold hover:underline focus:outline-none"
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
