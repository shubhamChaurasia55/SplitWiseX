import { hashSessionToken } from "../utils/auth.js";

import { findSessionByTokenHash } from "../repositories/session.repository.js";

import { findUserById } from "../repositories/user.repository.js";

import { AppError } from "../utils/AppError.js";

export async function requireAuth(req, res, next) {
  try {
    const sessionToken = req.cookies.session_token;

    if (!sessionToken) {
      throw new AppError(
        401,
        "UNAUTHENTICATED",
        "Authentication required."
      );
    }

    const tokenHash = hashSessionToken(sessionToken);

    const session = await findSessionByTokenHash(tokenHash);

    if (!session) {
      throw new AppError(
        401,
        "INVALID_SESSION",
        "Session is invalid or expired."
      );
    }

    const user = await findUserById(session.user_id);

    if (!user) {
      throw new AppError(
        401,
        "INVALID_SESSION",
        "Session is invalid or expired."
      );
    }

    req.user = user;
    req.session = session;

    next();
  } 
  catch (error) {
    next(error);
  }
}