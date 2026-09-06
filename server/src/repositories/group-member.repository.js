import pool from "../config/db.js";

export async function addGroupMember(
    db,
    {
        groupId,
        userId,
        role = "MEMBER",
    }
) {
    const result = await db.query(
        `
        INSERT INTO group_members (
            group_id,
            user_id,
            role
        )
        VALUES ($1, $2, $3)
        RETURNING
            group_id,
            user_id,
            role,
            joined_at
        `,
        [groupId, userId, role]
    );

    return result.rows[0];
}


export async function findGroupMember({
    groupId,
    userId,
}) {
    const result = await pool.query(
        `
        SELECT
            group_id,
            user_id,
            role,
            joined_at
        FROM group_members
        WHERE group_id = $1
          AND user_id = $2
        `,
        [groupId, userId]
    );

    return result.rows[0] || null;
}

export async function findGroupMembers(groupId) {
    const result = await pool.query(
        `
        SELECT
            u.id,
            u.name,
            u.email,
            gm.role,
            gm.joined_at
        FROM group_members gm
        JOIN users u
            ON u.id = gm.user_id
        WHERE gm.group_id = $1
        ORDER BY gm.joined_at ASC
        `,
        [groupId]
    );

    return result.rows;
}


export async function removeGroupMember({
    groupId,
    userId,
}) {
    const result = await pool.query(
        `
        DELETE FROM group_members
        WHERE group_id = $1
          AND user_id = $2
        RETURNING
            group_id,
            user_id,
            role
        `,
        [groupId, userId]
    );

    return result.rows[0] || null;
}