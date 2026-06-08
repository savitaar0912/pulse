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
          className="bg-emerald-500 text-white text-sm px-3 py-1 rounded hover:bg-emerald-600 disabled:opacity-50"
        >
          Mark all as read
        </button>
      </div>

      <div className="max-h-64 overflow-auto">
        {isLoading ? (
          <div className="p-4">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-sm text-gray-600">No notifications</div>
        ) : (
          notifications.map((n) => (
            <div key={n._id} className="flex gap-3 items-start p-3 hover:bg-gray-50">
              <Avatar src={n.actorId?.avatarUrl} username={n.actorId?.displayName} size="sm" />
              <div className="text-sm">
                <div className="font-medium">{n.actorId?.displayName}</div>
                <div className="text-gray-600">
                  {n.type === "like" && "liked your post"}
                  {n.type === "follow" && "started following you"}
                  {n.type === "comment" && "commented on your post"}
                </div>
              </div>
              {!n.isRead && <div className="ml-auto w-2 h-2 bg-emerald-500 rounded-full" />}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
