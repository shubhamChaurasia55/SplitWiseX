import { useEffect, useState } from "react";
import useNotificationStore from "../stores/notification.store";

function Notifications() {
  const notifications = useNotificationStore((state) => state.notifications);

  const isLoading = useNotificationStore((state) => state.isLoading);

  const loadNotifications = useNotificationStore(
    (state) => state.loadNotifications,
  );

  const markAsRead = useNotificationStore((state) => state.markAsRead);

  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);

  const deleteNotification = useNotificationStore(
    (state) => state.deleteNotification,
  );

  const [error, setError] = useState("");

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read,
  ).length;

  async function handleMarkAsRead(notificationId) {
    setError("");

    try {
      await markAsRead(notificationId);
    } catch (error) {
      setError(
        error.response?.data?.error?.message ||
          "Unable to mark notification as read.",
      );
    }
  }

  async function handleMarkAllAsRead() {
    setError("");

    try {
      await markAllAsRead();
    } catch (error) {
      setError(
        error.response?.data?.error?.message ||
          "Unable to mark notifications as read.",
      );
    }
  }

  async function handleDelete(notificationId) {
    setError("");

    try {
      await deleteNotification(notificationId);
    } catch (error) {
      setError(
        error.response?.data?.error?.message ||
          "Unable to delete notification.",
      );
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p className="text-sm text-gray-500">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Notifications
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Stay updated on your groups and expenses.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            className="text-sm font-medium text-gray-700 hover:text-gray-900 hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Notifications */}
      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
        {notifications.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-gray-500">No notifications yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start justify-between gap-6 px-6 py-5 ${
                  !notification.is_read ? "bg-gray-50" : "bg-white"
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {!notification.is_read && (
                      <span className="h-2 w-2 rounded-full bg-gray-900" />
                    )}

                    <h3 className="text-sm font-semibold text-gray-900">
                      {notification.title}
                    </h3>
                  </div>

                  <p className="mt-2 text-sm text-gray-600">
                    {notification.message}
                  </p>

                  <p className="mt-2 text-xs text-gray-400">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-4">
                  {!notification.is_read && (
                    <button
                      type="button"
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="text-sm font-medium text-gray-700 hover:text-gray-900 hover:underline"
                    >
                      Mark as read
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(notification.id)}
                    className="text-sm font-medium text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
