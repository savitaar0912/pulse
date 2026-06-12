import React from "react";
import { useNotifications, useMarkAllRead } from "../features/notifications/hooks/useNotifications";
import Avatar from "./Avatar";

export default function NotificationsList() {
  const { data, isLoading } = useNotifications();
  const { mutate: markAllRead, isLoading: marking } = useMarkAllRead();

  const notifications = data?.notifications ?? [];

  return (
    <div className="bg-white">
      <div className="p-3 border-b flex items-center justify-between">
        <h3 className="font-semibold">Notifications</h3>
        <button
          onClick={() => markAllRead()}
          disabled={marking}
          className="bg-emerald-500 text-white text-sm px-3 py-1 rounded hover:bg-emerald-600 disabled:opacity-50 whitespace-nowrap flex-shrink-0"
        >
          Mark all as read
        </button>
      </div>

      <div className="max-h-[30vh] md:max-h-64 overflow-auto">
        {isLoading ? (
          <div className="p-4">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-sm text-gray-600">No notifications</div>
        ) : (
          notifications.map((n) => (
            <div key={n._id} className="flex gap-2 items-center py-2.5 px-8 sm:py-2 sm:px-6 hover:bg-gray-50">
              <Avatar src={n.actorId?.avatarUrl} username={n.actorId?.displayName} size="xs" />
              <div className="text-sm sm:text-base flex-1 min-w-0">
                <div className="font-medium truncate text-sm">{n.actorId?.displayName}</div>
                <div className="text-gray-600 truncate text-xs">
                  {n.type === "like" && "liked your post"}
                  {n.type === "follow" && "started following you"}
                  {n.type === "comment" && "commented on your post"}
                </div>
              </div>
              {!n.isRead && <div className="ml-2 w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0" />}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
