import pool from "../config/db.js";

export async function createSession(
    db,
    {
        userId,
        tokenHash,
        expiresAt,
    }
) {
    const result = await db.query(
        `
        INSERT INTO sessions (
            user_id,
            token_hash,
            expires_at
        )
        VALUES ($1, $2, $3)
        RETURNING
            id,
            user_id,
            expires_at,
            created_at
        `,
        [userId, tokenHash, expiresAt]
    );

    return result.rows[0];
}

export async function findSessionByTokenHash(tokenHash) {
  const result = await pool.query(
    `
    SELECT
      id,
      user_id,
      expires_at,
      created_at,
      last_used_at
    FROM sessions
    WHERE token_hash = $1
      AND expires_at > NOW()
    `,
    [tokenHash]
  );

  return result.rows[0] || null;
}

export async function deleteSession(sessionId) {
  await pool.query(
    `
    DELETE FROM sessions
    WHERE id = $1
    `,
    [sessionId]
  );
}