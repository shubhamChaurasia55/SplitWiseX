import pool from "../config/db.js";


export async function createUser(
  client,
  {
    name,
    email,
    passwordHash,
  }
) {
  const result = await client.query(
    `
    INSERT INTO users (
      name,
      email,
      password_hash
    )
    VALUES ($1, $2, $3)
    RETURNING id, name, email, avatar_url, created_at, updated_at
    `,
    [name, email, passwordHash]
  );

  return result.rows[0];
}


export async function findUserByEmail(email) {
  const result = await pool.query(
    `
    SELECT id, name, email, password_hash, avatar_url, created_at, updated_at
    FROM users
    WHERE email = $1
    `,
    [email]
  );

  return result.rows[0] || null;
}


export async function findUserById(userId) {
  const result = await pool.query(
    `
    SELECT
      id,
      name,
      email,
      avatar_url,
      created_at,
      updated_at
    FROM users
    WHERE id = $1
    `,
    [userId]
  );

  return result.rows[0] || null;
}