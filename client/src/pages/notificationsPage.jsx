import {
  useMarkAllRead,
  useNotificaation,
} from "../features/notifications/hooks/useNotifications";
import Avatar from "../components/Avatar";

export default function NotificationsPage() {
  const { data, isLoading } = useNotificaation();
  const { mutate: markAllRead } = useMarkAllRead();

  const notifications = data?.notifications ?? [];

  const messages = {
    like: "liked your post",
    follow: "started following you",
    comment: "commented on your post",
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="max-w-xl mx-auto pt-6 pb-20 px-4">
      {/* Header with mark all read button */}
      <button onClick={() => markAllRead}></button>

      {/* Empty state */}

      {/* Notification list */}
      {notifications.map((notification) => (
        <div key={notification._id}>
          {/* Avatar of actor */}
          <Avatar2
            src={notification.actorId.avatarUrl}
            username={notification.actorId.displayName}
          />
          {/* Message — e.g "_savitaar_ liked your post" */}
          {`${notification.actorId.displayName} messages[notification.type]`}
          {/* Unread indicator */}
        </div>
      ))}
    </div>
  );
}
