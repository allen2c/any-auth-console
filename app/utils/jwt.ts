// app/utils/jwt.ts
import jwt from "jsonwebtoken";

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

  const secret = process.env.JWT_SECRET_KEY;
  if (!secret) {
    throw new Error("JWT_SECRET_KEY is not defined in environment variables");
  }

  return jwt.sign(payload, secret, { algorithm: "HS256" });
}
