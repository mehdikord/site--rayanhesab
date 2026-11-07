import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export const ADMIN_COOKIE =
  process.env.ADMIN_SESSION_COOKIE ?? 'rayan_admin_session';

export const SESSION_MAX_AGE = Number(process.env.ADMIN_SESSION_MAX_AGE ?? 86400);

export interface AdminSession {
  /** admin id as string */
  id: string;
  name: string;
  /** unix seconds when the session expires */
  exp: number;
  /**
   * Fingerprint of the admin's password hash at sign-in time. Changing the
   * password changes the fingerprint, which invalidates every older session.
   */
  pv: string;
}

const DEV_SECRET = 'rayanhesab-dev-secret';

/**
 * The HMAC secret for admin session cookies. A missing secret in production is
 * a deployment error: falling back to a public default would let anyone forge
 * an admin session, so we refuse instead.
 */
export function sessionSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET must be set (at least 32 characters) in production.');
  }
  return s || DEV_SECRET;
}

function sign(payload: string): string {
  return createHmac('sha256', sessionSecret()).update(payload).digest('base64url');
}

/** Short, non-reversible fingerprint of a password hash. */
export function passwordVersion(passwordHash: string): string {
  return createHash('sha256').update(passwordHash).digest('base64url').slice(0, 16);
}

/** Create a signed, tamper-evident session token: base64url(json).hmac */
export function createSessionToken(admin: {
  id: bigint | number | string;
  name: string;
  password: string;
}): string {
  const payload: AdminSession = {
    id: String(admin.id),
    name: admin.name,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
    pv: passwordVersion(admin.password),
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${sign(body)}`;
}

/** Verify a session token's signature and expiry. Returns the payload or null. */
export function verifySessionToken(token: string | undefined): AdminSession | null {
  if (!token) return null;
  const dot = token.lastIndexOf('.');
  if (dot < 1) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const expected = Buffer.from(sign(body));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return null;
  }

  let payload: AdminSession;
  try {
    payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as AdminSession;
  } catch {
    return null;
  }
  if (
    !payload ||
    typeof payload.id !== 'string' ||
    !/^\d+$/.test(payload.id) ||
    typeof payload.pv !== 'string' ||
    typeof payload.exp !== 'number' ||
    payload.exp < Math.floor(Date.now() / 1000)
  ) {
    return null;
  }
  return payload;
}
