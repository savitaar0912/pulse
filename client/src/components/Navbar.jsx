import React, { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../features/auth/store";
import Avatar from "./Avatar";
import { useLogout } from "../features/auth/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import NotificationsBell from "./NotificationsBell";
import { useDebounce } from "../hooks/useDebounce";
import { useSearch } from "../features/search/hooks/useSearch";

export default function Navbar() {
  const { user } = useAuthStore();
  const { mutate: handleLogout } = useLogout();
  const [username, setUsername] = useState("");
  const debounced = useDebounce(username, 500);
  const { data: searchResult, isLoading: searching } = useSearch(debounced);
  const searchUsers = searchResult?.users ?? [];
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // close dropdown when clicking outside
  useEffect(() => {
    const onDocClick = (e) => {
      if (!containerRef.current) return;
      const target = e.target;
      if (!containerRef.current.contains(target) && target.tagName !== 'INPUT') {
        setOpen(false);
        setActiveIndex(-1);
      }
    };

    window.addEventListener('click', onDocClick);
    return () => window.removeEventListener('click', onDocClick);
  }, []);

  // close dropdown when query clears
  useEffect(() => {
    if (!debounced) {
      setOpen(false);
      setActiveIndex(-1);
    } else if (debounced.length > 0) {
      setOpen(true);
    }
  }, [debounced]);

  // reset activeIndex when results change
  useEffect(() => {
    setActiveIndex(-1);
  }, [searchUsers]);
  return (
    <nav className="w-full flex items-center px-4 py-2 bg-white shadow">
      {/* Left: Logo */}
      <div className="flex items-center flex-shrink-0">
        <Link to="/" className="flex items-center gap-2">
          <img src="/favicon.png" alt="PULSE" className="h-10 rounded" />
        </Link>
      </div>

      {/* Center: Search (desktop) and mobile search icon */}
      <div className="flex-1 flex justify-center px-4">
        <div className="w-full max-w-md relative">
          {/* Desktop input */}
          <input
            type="text"
            placeholder="Search User"
            className="hidden sm:block bg-gray-100 rounded-full px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-400"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onFocus={() => debounced && debounced.length > 0 && setOpen(true)}
            onKeyDown={(e) => {
              if (!searchUsers.length) return;
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex((i) => Math.min(i + 1, searchUsers.length - 1));
                setOpen(true);
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex((i) => Math.max(i - 1, 0));
              } else if (e.key === 'Enter') {
                if (activeIndex >= 0 && searchUsers[activeIndex]) {
                  const u = searchUsers[activeIndex];
                  setOpen(false);
                  setUsername('');
                  navigate(`/${u.username}`);
                }
              } else if (e.key === 'Escape') {
                setOpen(false);
              }
            }}
          />

          {/* Mobile search icon */}
          <button
            className="sm:hidden p-2 rounded-full hover:bg-gray-100 focus:outline-none"
            onClick={() => setMobileSearchOpen(true)}
            aria-label="Open search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
          </button>

          {/* Search dropdown (desktop) */}
          {open && debounced && debounced.length > 0 && (
            <div ref={containerRef} className="absolute top-full mt-2 w-full bg-white rounded-md shadow-lg z-20">
              {searching ? (
                <div className="p-2 text-sm text-gray-600">Searching...</div>
              ) : searchUsers.length === 0 ? (
                <div className="p-2 text-sm text-gray-600">No users</div>
              ) : (
                searchUsers.map((u) => (
                  <Link
                    key={u._id}
                    to={`/${u.username}`}
                    onClick={() => { setOpen(false); setUsername(''); }}
                    className={`flex items-center gap-3 p-2 hover:bg-gray-50 ${activeIndex >= 0 && searchUsers[activeIndex]?._id === u._id ? 'bg-gray-100' : ''}`}
                  >
                    <Avatar src={u.avatarUrl} username={u.displayName} />
                    <div className="text-sm">
                      <div className="font-medium">{u.displayName}</div>
                      <div className="text-gray-500 text-xs">@{u.username}</div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}

          {/* Mobile full-screen search overlay */}
          {mobileSearchOpen && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-start">
              <div className="w-full p-4 bg-white">
                <div className="flex items-center gap-2">
                  <button onClick={() => setMobileSearchOpen(false)} className="p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search User"
                    className="bg-gray-100 rounded-full px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="mt-4 bg-white">
                  {searching ? (
                    <div className="p-2 text-sm text-gray-600">Searching...</div>
                  ) : searchUsers.length === 0 ? (
                    <div className="p-2 text-sm text-gray-600">No users</div>
                  ) : (
                    searchUsers.map((u) => (
                      <Link key={u._id} to={`/${u.username}`} onClick={() => { setMobileSearchOpen(false); setUsername(''); }} className="flex items-center gap-3 p-2 border-b">
                        <Avatar src={u.avatarUrl} username={u.displayName} />
                        <div>
                          <div className="font-medium">{u.displayName}</div>
                          <div className="text-gray-500 text-xs">@{u.username}</div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: User icons */}
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <NotificationsBell />
            <Link to={`/${user.username}`}>
              <Avatar src={user.avatarUrl} username={user.username} />
            </Link>
            <button
              onClick={() => handleLogout()}
              className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
              title="Log out"
              aria-label="Log out"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1" />
              </svg>
            </button>
          </>
        ) : (
          <Link to="/login" className="text-emerald-600 font-semibold">Log In</Link>
        )}
      </div>
    </nav>
  );
}
