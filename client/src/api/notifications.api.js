import apiClient from "./client";

export async function getNotifications() {
    const response = await apiClient.get("/notifications");

    return response.data;
}

export async function getUnreadNotificationCount() {
    const response = await apiClient.get(
        "/notifications/unread-count"
    );

    return response.data;
}

export async function markNotificationAsRead(
    notificationId
) {
    const response = await apiClient.patch(
        `/notifications/${notificationId}/read`
    );

    return response.data;
}

export async function markAllNotificationsAsRead() {
    const response = await apiClient.patch(
        "/notifications/read-all"
    );

    return response.data;
}

export async function deleteNotification(notificationId) {
    const response = await apiClient.delete(
        `/notifications/${notificationId}`
    );

    return response.data;
}