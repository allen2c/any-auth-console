// app/utils/jwt.ts

import jwt from "jsonwebtoken";

/**
 * Creates a JWT token for the given user ID
 */
export function createJwtToken(
  userId: string,
  expiresIn: number = 3600
): string {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: userId,
    iat: now,
    exp: now + expiresIn,
    nonce: crypto.randomUUID(),
  };

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is not defined in environment variables");
  }

  return jwt.sign(payload, secret, { algorithm: "HS256" });
}

/**
 * Verifies a JWT token and returns the payload
 */
export function verifyJwtToken(token: string): unknown {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is not defined in environment variables");
  }

  try {
    return jwt.verify(token, secret);
  } catch (error) {
    console.error("JWT verification failed:", error);
    throw error;
  }
}

/**
 * Decodes a JWT token without verification
 */
export function decodeJwtToken(token: string): unknown {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error("JWT decode failed:", error);
    throw error;
  }
}

/**
 * Checks if a token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as { exp?: number };
    if (!decoded || !decoded.exp) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    console.error("Error checking token expiration:", error);
    return true; // Assume expired if we can't decode
  }
}
