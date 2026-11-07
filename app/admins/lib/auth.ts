import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/app/lib/prisma';
import {
  ADMIN_COOKIE,
  passwordVersion,
  verifySessionToken,
  type AdminSession,
} from './session';

/**
 * Read the current admin session from the request cookie and confirm it
 * against the database: the admin must still exist, be active, and have the
 * same password as when the session was issued. Cached per request so the
 * layout and server actions share one lookup.
 */
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  const store = await cookies();
  const payload = verifySessionToken(store.get(ADMIN_COOKIE)?.value);
  if (!payload) return null;

  const admin = await prisma.admin.findUnique({
    where: { id: BigInt(payload.id) },
    select: { id: true, name: true, isActive: true, password: true },
  });
  if (!admin || !admin.isActive || passwordVersion(admin.password) !== payload.pv) {
    return null;
  }
  // Prefer the current name, so a rename shows up without signing in again.
  return { ...payload, name: admin.name };
});

/**
 * Guard for server components & server actions.
 * Redirects to the admin login page when no valid session exists.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admins/login');
  }
  return session;
}
