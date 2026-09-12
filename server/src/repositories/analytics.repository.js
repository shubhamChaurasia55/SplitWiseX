import pool from "../config/db.js";

export async function findGroupExpenseSummary(
    groupId
) {
    const result = await pool.query(
        `
        SELECT
            COUNT(*) AS total_expenses,

            COALESCE(
                ROUND(SUM(amount) * 100)::BIGINT,
                0
            ) AS total_amount_paise,

            COALESCE(
                ROUND(AVG(amount) * 100)::BIGINT,
                0
            ) AS average_amount_paise,

            COALESCE(
                ROUND(MAX(amount) * 100)::BIGINT,
                0
            ) AS highest_amount_paise,

            COALESCE(
                ROUND(MIN(amount) * 100)::BIGINT,
                0
            ) AS lowest_amount_paise

        FROM expenses

        WHERE group_id = $1
        `,
        [groupId]
    );

    return result.rows[0];
}

export async function findGroupMemberSpending(
    groupId
) {
    const result = await pool.query(
        `
        SELECT
            u.id AS user_id,
            u.name,

            COALESCE(
                ROUND(
                    SUM(e.amount) * 100
                )::BIGINT,
                0
            ) AS total_paid_paise

        FROM group_members gm

        JOIN users u
            ON u.id = gm.user_id

        LEFT JOIN expenses e
            ON e.paid_by = u.id
            AND e.group_id = gm.group_id

        WHERE gm.group_id = $1

        GROUP BY
            u.id,
            u.name

        ORDER BY
            total_paid_paise DESC
        `,
        [groupId]
    );

    return result.rows;
}