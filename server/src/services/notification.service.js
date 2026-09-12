import {
    createNotification,
    findNotificationsByUserId,
    countUnreadNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
} from "../repositories/notification.repository.js";

import { AppError } from "../utils/AppError.js";


export async function createNewNotification({
    userId,
    type,
    title,
    message,
}) {
    return await createNotification({
        userId,
        type,
        title,
        message,
    });
}


export async function getUserNotifications({
    userId,
}) {
    return await findNotificationsByUserId(userId);
}


export async function getUnreadNotificationCount({
    userId,
}) {
    return await countUnreadNotifications(userId);
}


export async function readNotification({
    notificationId,
    userId,
}) {
    const notification =
        await markNotificationAsRead(
            notificationId,
            userId
        );

    if (!notification) {
        throw new AppError(
            404,
            "NOTIFICATION_NOT_FOUND",
            "Notification not found."
        );
    }

    return notification;
}


export async function readAllNotifications({
    userId,
}) {
    return await markAllNotificationsAsRead(
        userId
    );
}


export async function removeNotification({
    notificationId,
    userId,
}) {
    const notification =
        await deleteNotification(
            notificationId,
            userId
        );

    if (!notification) {
        throw new AppError(
            404,
            "NOTIFICATION_NOT_FOUND",
            "Notification not found."
        );
    }

    return notification;
}