import pool from "../config/db.js";


export async function createGroup(
    client,
    {
        name,
        createdBy,
    }
) {
    const result = await client.query(
        `
        INSERT INTO groups (
            name,
            created_by
        )
        VALUES ($1, $2)
        RETURNING
            id,
            name,
            created_by,
            created_at,
            updated_at
        `,
        [name, createdBy]
    );

    return result.rows[0];
}


export async function findGroupsByUserId(userId) {
    const result = await pool.query(
        `
        SELECT
            g.id,
            g.name,
            g.created_by,
            g.created_at,
            g.updated_at
        FROM groups g
        JOIN group_members gm
            ON gm.group_id = g.id
        WHERE gm.user_id = $1
        ORDER BY g.created_at DESC
        `,
        [userId]
    );

    return result.rows;
}


export async function findGroupByIdForUser(groupId, userId) {
    const result = await pool.query(
        `
        SELECT
            g.id,
            g.name,
            g.created_by,
            g.created_at,
            g.updated_at,
            gm.role
        FROM groups g
        JOIN group_members gm
            ON gm.group_id = g.id
        WHERE g.id = $1
          AND gm.user_id = $2
        `,
        [groupId, userId]
    );

    return result.rows[0] || null;
}