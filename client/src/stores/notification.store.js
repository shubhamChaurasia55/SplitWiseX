import { create } from "zustand";

import {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
} from "../api/notifications.api";

const useNotificationStore = create((set) => ({
    notifications: [],
    isLoading: false,

    loadNotifications: async () => {
        set({ isLoading: true });

        try {
            const response = await getNotifications();

            set({
                notifications:
                    response.data.notifications || [],
            });
        } finally {
            set({ isLoading: false });
        }
    },

    markAsRead: async (notificationId) => {
        // Update UI immediately
        set((state) => ({
            notifications: state.notifications.map(
                (notification) =>
                    notification.id === notificationId
                        ? {
                              ...notification,
                              is_read: true,
                          }
                        : notification
            ),
        }));

        try {
            // Then update backend
            await markNotificationAsRead(notificationId);
        } catch (error) {
            // If backend fails, reload the real state
            await getNotifications().then((response) => {
                set({
                    notifications:
                        response.data.notifications || [],
                });
            });

            throw error;
        }
    },

    markAllAsRead: async () => {
        // Update UI immediately
        set((state) => ({
            notifications: state.notifications.map(
                (notification) => ({
                    ...notification,
                    is_read: true,
                })
            ),
        }));

        try {
            await markAllNotificationsAsRead();
        } catch (error) {
            await getNotifications().then((response) => {
                set({
                    notifications:
                        response.data.notifications || [],
                });
            });

            throw error;
        }
    },

    deleteNotification: async (notificationId) => {
        // Update UI immediately
        set((state) => ({
            notifications: state.notifications.filter(
                (notification) =>
                    notification.id !== notificationId
            ),
        }));

        try {
            await deleteNotification(notificationId);
        } catch (error) {
            await getNotifications().then((response) => {
                set({
                    notifications:
                        response.data.notifications || [],
                });
            });

            throw error;
        }
    },
}));

export default useNotificationStore;