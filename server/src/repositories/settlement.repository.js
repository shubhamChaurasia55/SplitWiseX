import pool from "../config/db.js";

export async function createSettlement(
    db,
    {
        groupId,
        paidBy,
        paidTo,
        amount,
    }
) {
    const result = await db.query(
        `
        INSERT INTO settlements (
            group_id,
            paid_by,
            paid_to,
            amount
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
            id,
            group_id,
            paid_by,
            paid_to,
            amount,
            created_at
        `,
        [
            groupId,
            paidBy,
            paidTo,
            amount,
        ]
    );

    return result.rows[0];
}

export async function findSettlementsByGroupId(
    groupId
) {
    const result = await pool.query(
        `
        SELECT
            s.id,
            s.group_id,
            s.paid_by,
            payer.name AS paid_by_name,
            s.paid_to,
            receiver.name AS paid_to_name,
            s.amount,
            s.created_at
        FROM settlements s

        JOIN users payer
            ON payer.id = s.paid_by

        JOIN users receiver
            ON receiver.id = s.paid_to

        WHERE s.group_id = $1

        ORDER BY s.created_at DESC
        `,
        [groupId]
    );

    return result.rows;
}


export async function findGroupSettlementBalances(groupId) {
    const result = await pool.query(
        `
        WITH participants AS (
            SELECT user_id
            FROM group_members
            WHERE group_id = $1

            UNION

            SELECT paid_by
            FROM settlements
            WHERE group_id = $1

            UNION

            SELECT paid_to
            FROM settlements
            WHERE group_id = $1
        )

        SELECT
            p.user_id,

            COALESCE(
                paid.total_paid_paise,
                0
            ) AS total_settlement_paid_paise,

            COALESCE(
                received.total_received_paise,
                0
            ) AS total_settlement_received_paise

        FROM participants p

        LEFT JOIN (
            SELECT
                paid_by AS user_id,
                ROUND(SUM(amount) * 100)::BIGINT
                    AS total_paid_paise
            FROM settlements
            WHERE group_id = $1
            GROUP BY paid_by
        ) paid
            ON paid.user_id = p.user_id

        LEFT JOIN (
            SELECT
                paid_to AS user_id,
                ROUND(SUM(amount) * 100)::BIGINT
                    AS total_received_paise
            FROM settlements
            WHERE group_id = $1
            GROUP BY paid_to
        ) received
            ON received.user_id = p.user_id

        ORDER BY p.user_id
        `,
        [groupId]
    );

    return result.rows;
}