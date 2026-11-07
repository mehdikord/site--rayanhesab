import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Defense-in-depth guard for the admin panel. The (panel) layout and every
// server action perform the authoritative check (signature + DB state); this proxy bounces anonymous /admins/* traffic to login
// before the render pipeline runs. Kept self-contained (no app-module imports)
// so the proxy bundle stays independent.

const COOKIE = process.env.ADMIN_SESSION_COOKIE ?? 'rayan_admin_session';

function validToken(token: string | undefined): boolean {
  if (!token) return false;
  const dot = token.lastIndexOf('.');
  if (dot < 1) return false;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const secret = process.env.SESSION_SECRET;
  // Mirrors sessionSecret(): no default secret in production.
  if (!secret && process.env.NODE_ENV === 'production') return false;
  const key = secret || 'rayanhesab-dev-secret';
  const expected = Buffer.from(createHmac('sha256', key).update(body).digest('base64url'));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return false;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as {
      id?: string;
      exp?: number;
    };
    if (!payload || typeof payload.id !== 'string' || !payload.exp) return false;
    return payload.exp >= Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get(COOKIE)?.value;
  if (validToken(token)) return;

  const url = new URL('/admins/login', request.url);
  url.searchParams.set('next', request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  // Guard every admin route except the login page (avoids a redirect loop on /admins/login).
  matcher: ['/admins/((?!login$|login/).*)'],
};
