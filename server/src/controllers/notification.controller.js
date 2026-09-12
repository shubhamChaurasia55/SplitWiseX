import {
    getUserNotifications,
    getUnreadNotificationCount,
    readNotification,
    readAllNotifications,
    removeNotification,
} from "../services/notification.service.js";


export async function getNotifications(
    req,
    res,
    next
) {
    try {
        const notifications =
            await getUserNotifications({
                userId: req.user.id,
            });

        return res.status(200).json({
            success: true,
            data: {
                notifications,
            },
        });
    } catch (error) {
        next(error);
    }
}


export async function getUnreadCount(
    req,
    res,
    next
) {
    try {
        const unreadCount =
            await getUnreadNotificationCount({
                userId: req.user.id,
            });

        return res.status(200).json({
            success: true,
            data: {
                unreadCount,
            },
        });
    } catch (error) {
        next(error);
    }
}


export async function markAsRead(
    req,
    res,
    next
) {
    try {
        const notification =
            await readNotification({
                notificationId:
                    req.params.notificationId,
                userId: req.user.id,
            });

        return res.status(200).json({
            success: true,
            data: notification,
        });
    } catch (error) {
        next(error);
    }
}


export async function markAllAsRead(
    req,
    res,
    next
) {
    try {
        const notifications =
            await readAllNotifications({
                userId: req.user.id,
            });

        return res.status(200).json({
            success: true,
            data: {
                notifications,
            },
        });
    } catch (error) {
        next(error);
    }
}


export async function deleteNotification(
    req,
    res,
    next
) {
    try {
        const notification =
            await removeNotification({
                notificationId:
                    req.params.notificationId,
                userId: req.user.id,
            });

        return res.status(200).json({
            success: true,
            data: notification,
        });
    } catch (error) {
        next(error);
    }
}