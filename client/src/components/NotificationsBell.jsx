import { useState } from "react";
import NotificationsList from "./NotificationsList";
import { useNotifications } from "../features/notifications/hooks/useNotifications";

export default function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const { data } = useNotifications();
  const notifications = data?.notifications ?? [];
  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div className="relative">
      <button
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
        type="button"
      >
        {/* Bell icon */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </button>

      {hasUnread && (
        <span className="absolute top-1 right-2.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
      )}

      {open && (
        <>
          {/* Overlay to close modal when clicking outside */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-md z-50">
            <NotificationsList />
          </div>
        </>
      )}
    </div>
  );
}
