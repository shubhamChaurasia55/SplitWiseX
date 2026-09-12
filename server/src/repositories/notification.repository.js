import pool from "../config/db.js";

export async function createNotification({
    userId,
    type,
    title,
    message,
}) {
    const result = await pool.query(
        `
        INSERT INTO notifications (
            user_id,
            type,
            title,
            message
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
            id,
            user_id,
            type,
            title,
            message,
            is_read,
            created_at
        `,
        [
            userId,
            type,
            title,
            message,
        ]
    );

    return result.rows[0];
}


export async function findNotificationsByUserId(
    userId
) {
    const result = await pool.query(
        `
        SELECT
            id,
            user_id,
            type,
            title,
            message,
            is_read,
            created_at
        FROM notifications
        WHERE user_id = $1
        ORDER BY created_at DESC
        `,
        [userId]
    );

    return result.rows;
}

export async function countUnreadNotifications(
    userId
) {
    const result = await pool.query(
        `
        SELECT COUNT(*) AS unread_count
        FROM notifications
        WHERE user_id = $1
          AND is_read = FALSE
        `,
        [userId]
    );

    return Number(result.rows[0].unread_count);
}


export async function markNotificationAsRead(
    notificationId,
    userId
) {
    const result = await pool.query(
        `
        UPDATE notifications
        SET is_read = TRUE
        WHERE id = $1
          AND user_id = $2
        RETURNING
            id,
            user_id,
            type,
            title,
            message,
            is_read,
            created_at
        `,
        [
            notificationId,
            userId,
        ]
    );

    return result.rows[0] || null;
}

export async function markAllNotificationsAsRead(
    userId
) {
    const result = await pool.query(
        `
        UPDATE notifications
        SET is_read = TRUE
        WHERE user_id = $1
          AND is_read = FALSE
        RETURNING
            id,
            user_id,
            type,
            title,
            message,
            is_read,
            created_at
        `,
        [userId]
    );

    return result.rows;
}

export async function deleteNotification(
    notificationId,
    userId
) {
    const result = await pool.query(
        `
        DELETE FROM notifications
        WHERE id = $1
          AND user_id = $2
        RETURNING id
        `,
        [
            notificationId,
            userId,
        ]
    );

    return result.rows[0] || null;
}