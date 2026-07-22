import { SignJWT, jwtVerify } from 'jose';
import type { JWTPayload } from '@/types';

// The TextEncoder call is cached so it doesn't re-run on every request
const getSecret = (): Uint8Array => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is not set');
  return new TextEncoder().encode(secret);
};

const EXPIRY = '7d';
const ALGORITHM = 'HS256';

/**
 * Sign a JWT with the user's id and email.
 * Returns the token string to be stored in an httpOnly cookie.
 */
export async function signToken(
  payload: Omit<JWTPayload, 'iat' | 'exp'>
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(getSecret());
}

/**
 * Verify a JWT and return the decoded payload.
 * Throws if the token is invalid, expired, or tampered with.
 */
export async function verifyToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, getSecret(), {
    algorithms: [ALGORITHM],
  });

  return {
    userId: payload.userId as string,
    email: payload.email as string,
    iat: payload.iat,
    exp: payload.exp,
  };
}

// ─── Cookie config ───────────────────────────────────────────────────────────
// Centralised here so the same settings are used in login, logout, and
// any future token-refresh routes.

export const AUTH_COOKIE_NAME = 'lrs-auth-token';

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
};
