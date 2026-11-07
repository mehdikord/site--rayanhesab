'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { prisma } from '@/app/lib/prisma';
import { normalizeMobile } from '@/app/lib/validation';
import { clientIp, rateLimit, resetRateLimit } from '@/app/lib/rate-limit';
import { ADMIN_COOKIE, SESSION_MAX_AGE, createSessionToken } from '@/app/admins/lib/session';

export interface LoginState {
  error: string | null;
}

const INVALID = 'موبایل یا رمز عبور اشتباه است، یا حساب غیرفعال است.';

/** Only allow redirects back into the admin panel (no open redirects). */
function safeNext(raw: FormDataEntryValue | null): string {
  const next = String(raw ?? '');
  return /^\/admins(\/[\w\-/]*)?$/.test(next) && !next.startsWith('/admins/login')
    ? next
    : '/admins';
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const mobile = normalizeMobile(String(formData.get('mobile') ?? ''));
  const password = String(formData.get('password') ?? '');

  if (!mobile || !password) {
    return { error: 'شماره موبایل معتبر (مثل 09120000000) و رمز عبور را وارد کنید.' };
  }

  // 10 attempts per 15 minutes per IP, and per targeted account.
  const ip = (await clientIp()) ?? 'unknown';
  const ipKey = `admin-login:ip:${ip}`;
  const accountKey = `admin-login:acct:${mobile}`;
  if (!rateLimit(ipKey, 10, 15 * 60_000) || !rateLimit(accountKey, 10, 15 * 60_000)) {
    return { error: 'تعداد تلاش‌ها زیاد است؛ چند دقیقه بعد دوباره امتحان کنید.' };
  }

  const admin = await prisma.admin.findUnique({ where: { mobile } });
  // Compare even for unknown accounts so timing does not reveal which exist.
  const hash = admin?.password ?? '$2b$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv';
  const ok = await bcrypt.compare(password, hash);
  if (!admin || !admin.isActive || !ok) {
    return { error: INVALID };
  }

  resetRateLimit(accountKey);

  const store = await cookies();
  store.set(ADMIN_COOKIE, createSessionToken(admin), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });

  await prisma.admin.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  });

  redirect(safeNext(formData.get('next')));
}

export async function logout() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect('/admins/login');
}
