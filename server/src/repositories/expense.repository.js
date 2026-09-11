import pool from "../config/db.js";

export async function createExpense(
    db,
    {
        groupId,
        description,
        amount,
        paidBy,
        splitType,
        createdBy,
    }
) {
    const result = await db.query(
        `
        INSERT INTO expenses (
            group_id,
            description,
            amount,
            paid_by,
            split_type,
            created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING
            id,
            group_id,
            description,
            amount,
            paid_by,
            split_type,
            created_by,
            created_at,
            updated_at
        `,
        [
            groupId,
            description,
            amount,
            paidBy,
            splitType,
            createdBy,
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
            e.created_by,
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
            e.created_by,
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


export async function findExpenseByIdForUpdate(
    client,
    expenseId,
    groupId
) {
    const result = await client.query(
        `
        SELECT
            id,
            group_id,
            description,
            amount,
            paid_by,
            split_type,
            created_by,
            created_at,
            updated_at
        FROM expenses
        WHERE id = $1
          AND group_id = $2
        FOR UPDATE
        `,
        [
            expenseId,
            groupId,
        ]
    );

    return result.rows[0] || null;
}

export async function deleteExpenseSplits(
    client,
    expenseId
) {
    await client.query(
        `
        DELETE FROM expense_splits
        WHERE expense_id = $1
        `,
        [expenseId]
    );
}

export async function updateExpense(
    client,
    {
        expenseId,
        groupId,
        description,
        amount,
        paidBy,
        splitType,
    }
) {
    const result = await client.query(
        `
        UPDATE expenses
        SET
            description = $1,
            amount = $2,
            paid_by = $3,
            split_type = $4,
            updated_at = NOW()
        WHERE id = $5
          AND group_id = $6
        RETURNING
            id,
            group_id,
            description,
            amount,
            paid_by,
            split_type,
            created_by,
            created_at,
            updated_at
        `,
        [
            description,
            amount,
            paidBy,
            splitType,
            expenseId,
            groupId,
        ]
    );

    return result.rows[0] || null;
}


export async function deleteExpense(
    client,
    {
        expenseId,
        groupId,
    }
) {
    const result = await client.query(
        `
        DELETE FROM expenses
        WHERE id = $1
          AND group_id = $2
        RETURNING
            id,
            group_id,
            description,
            amount,
            paid_by,
            split_type,
            created_by
        `,
        [
            expenseId,
            groupId,
        ]
    );

    return result.rows[0] || null;
}

export async function findGroupExpenseBalances(groupId) {
  const result = await pool.query(
    `
    SELECT
      gm.user_id,
      u.name,
      u.email,
      COALESCE(paid.total_paid_paise, 0) AS total_paid_paise,
      COALESCE(owed.total_owed_paise, 0) AS total_owed_paise
    FROM group_members gm
    JOIN users u ON u.id = gm.user_id

    LEFT JOIN (
      SELECT paid_by AS user_id, ROUND(SUM(amount) * 100)::BIGINT AS total_paid_paise
      FROM expenses
      WHERE group_id = $1
      GROUP BY paid_by
    ) paid ON paid.user_id = gm.user_id

    LEFT JOIN (
      SELECT es.user_id, ROUND(SUM(es.amount) * 100)::BIGINT AS total_owed_paise
      FROM expense_splits es
      JOIN expenses e ON e.id = es.expense_id
      WHERE e.group_id = $1
      GROUP BY es.user_id
    ) owed ON owed.user_id = gm.user_id

    WHERE gm.group_id = $1
    ORDER BY u.name
    `,
    [groupId]
  );

  return result.rows;
}