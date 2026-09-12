import express from "express";

import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
} from "../controllers/notification.controller.js";

import { requireAuth } from "../middleware/auth.middleware.js";


const router = express.Router();


router.get(
    "/",
    requireAuth,
    getNotifications
);


router.get(
    "/unread-count",
    requireAuth,
    getUnreadCount
);


router.patch(
    "/:notificationId/read",
    requireAuth,
    markAsRead
);


router.patch(
    "/read-all",
    requireAuth,
    markAllAsRead
);


router.delete(
    "/:notificationId",
    requireAuth,
    deleteNotification
);


export default router;