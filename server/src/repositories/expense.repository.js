import pool from "../config/db.js";

export async function createExpense(
    db,
    {
        groupId,
        description,
        amount,
        paidBy,
        splitType,
    }
) {
    const result = await db.query(
        `
        INSERT INTO expenses (
            group_id,
            description,
            amount,
            paid_by,
            split_type
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
            id,
            group_id,
            description,
            amount,
            paid_by,
            split_type,
            created_at,
            updated_at
        `,
        [
            groupId,
            description,
            amount,
            paidBy,
            splitType,
        ]
    );

    return result.rows[0];
}



export async function createExpenseSplit(
    db,
    {
        expenseId,
        userId,
        amount,
        percentage = null,
    }
) {
    const result = await db.query(
        `
        INSERT INTO expense_splits (
            expense_id,
            user_id,
            amount,
            percentage
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
            expense_id,
            user_id,
            amount,
            percentage
        `,
        [
            expenseId,
            userId,
            amount,
            percentage,
        ]
    );

    return result.rows[0];
}


export async function findExpensesByGroupId(groupId) {
    const result = await pool.query(
        `
        SELECT
            e.id,
            e.group_id,
            e.description,
            e.amount,
            e.paid_by,
            e.split_type,
            e.created_at,
            e.updated_at,

            u.name AS paid_by_name

        FROM expenses e

        JOIN users u
            ON u.id = e.paid_by

        WHERE e.group_id = $1

        ORDER BY e.created_at DESC
        `,
        [groupId]
    );

    return result.rows;
}


export async function findExpenseById(
    expenseId,
    groupId
) {
    const result = await pool.query(
        `
        SELECT
            e.id,
            e.group_id,
            e.description,
            e.amount,
            e.paid_by,
            e.split_type,
            e.created_at,
            e.updated_at,

            u.name AS paid_by_name

        FROM expenses e

        JOIN users u
            ON u.id = e.paid_by

        WHERE e.id = $1
          AND e.group_id = $2
        `,
        [
            expenseId,
            groupId,
        ]
    );

    return result.rows[0] || null;
}


export async function findExpenseSplits(
    expenseId
) {
    const result = await pool.query(
        `
        SELECT
            es.expense_id,
            es.user_id,
            es.amount,
            es.percentage,

            u.name,
            u.email

        FROM expense_splits es

        JOIN users u
            ON u.id = es.user_id

        WHERE es.expense_id = $1

        ORDER BY es.user_id
        `,
        [expenseId]
    );

    return result.rows;
}