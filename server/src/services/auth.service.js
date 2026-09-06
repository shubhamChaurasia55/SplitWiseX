import bcrypt from "bcrypt";

import { AppError } from "../utils/AppError.js";
import { findUserByEmail, createUser } from "../repositories/user.repository.js";
import { createSession, deleteSession } from "../repositories/session.repository.js";
import { generateSessionToken, hashSessionToken } from "../utils/auth.js";
import { withTransaction } from "../utils/transaction.js";
import pool from "../config/db.js";


export async function registerUser({ name, email, password }) {

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await findUserByEmail(normalizedEmail);

    if (existingUser) {
        throw new AppError(
            409,
            "EMAIL_ALREADY_EXISTS",
            "An account with this email already exists."
        );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    try{
         const result = await withTransaction(async (client) => {

        const user = await createUser(client, {
            name,
            email: normalizedEmail,
            passwordHash,
        });

        const sessionToken = generateSessionToken();

        const tokenHash = hashSessionToken(sessionToken);

        const expiresAt = new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
        );

        await createSession(client, {
            userId: user.id,
            tokenHash,
            expiresAt,
        });

        return {
            user,
            sessionToken,
        };
        });

        return result;
    }
    catch (error) {

        if (error.code === "23505") {
            throw new AppError(
                409,
                "EMAIL_ALREADY_EXISTS",
                "An account with this email already exists."
            );
        }

        throw error;
    }
   
}

export async function logoutUser(sessionId) {
    await deleteSession(sessionId);
}

export async function loginUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    throw new AppError(
      401,
      "INVALID_CREDENTIALS",
      "Invalid email or password."
    );
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!passwordMatches) {
    throw new AppError(
      401,
      "INVALID_CREDENTIALS",
      "Invalid email or password."
    );
  }

  const sessionToken = generateSessionToken();

  const tokenHash = hashSessionToken(sessionToken);

  const expiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  );

  await createSession(pool, {
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar_url: user.avatar_url,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };

  return {
    user: safeUser,
    sessionToken,
  };
}