'use server';

import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { prisma } from '@/app/lib/prisma';
import { parseLocalInputValue } from '@/app/lib/datetime';
import { requireAdmin } from '@/app/admins/lib/auth';
import type { ActionResult } from '@/app/admins/_components/Confirm';
import { Prisma } from '@prisma/client';
import { EMAIL_RE, normalizeMobile } from '@/app/lib/validation';

function toBigInt(v: string | FormDataEntryValue | null): bigint | undefined {
  const s = String(v ?? '').trim();
  return s === '' ? undefined : BigInt(s);
}
function clean(s: string | FormDataEntryValue | null): string | null {
  const t = String(s ?? '').trim();
  return t === '' ? null : t;
}
function toAmount(v: string | FormDataEntryValue | null): number {
  const s = String(v ?? '').trim();
  if (s === '') return 0;
  const n = Number(s);
  return Number.isNaN(n) ? 0 : Math.max(0, Math.trunc(n));
}

function touch() {
  revalidatePath('/admins/users');
  revalidatePath('/admins');
}

/* ───────────────────────── Users ───────────────────────── */

export async function upsertUser(fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = toBigInt(fd.get('id'));

  const name = clean(fd.get('name'));
  if (!name) return { ok: false, message: 'نام الزامی است.' };
  const mobile = normalizeMobile(String(fd.get('mobile') ?? ''));
  if (!mobile) return { ok: false, message: 'شماره موبایل معتبر نیست (مثل 09121234567).' };
  const email = clean(fd.get('email'))?.toLowerCase() ?? null;
  if (email && !EMAIL_RE.test(email)) return { ok: false, message: 'ایمیل معتبر نیست.' };

  const data = {
    name,
    mobile,
    email,
    bio: clean(fd.get('bio')),
    avatar: clean(fd.get('avatar')),
    isActive: fd.get('isActive') === '1',
  };

  try {
    if (id) {
      await prisma.user.update({ where: { id }, data });
      // Optional password reset
      const pwd = clean(fd.get('password'));
      if (pwd && pwd.length < 8) return { ok: false, message: 'رمز عبور باید حداقل ۸ کاراکتر باشد.' };
      if (pwd) {
        await prisma.user.update({
          where: { id },
          data: { password: await bcrypt.hash(pwd, 10) },
        });
      }
    } else {
      // Customers sign in by mobile; a password is optional for new users.
      const pwd = clean(fd.get('password'));
      if (pwd && pwd.length < 8) return { ok: false, message: 'رمز عبور باید حداقل ۸ کاراکتر باشد.' };
      await prisma.user.create({
        data: { ...data, password: pwd ? await bcrypt.hash(pwd, 10) : null },
      });
    }
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { ok: false, message: 'این موبایل یا ایمیل قبلاً ثبت شده است.' };
    }
    throw e;
  }

  touch();
  return { ok: true };
}

export async function deleteUser(userId: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await prisma.user.delete({ where: { id: BigInt(userId) } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && (e.code === 'P2003' || e.code === 'P2014')) {
      return {
        ok: false,
        message: 'این کاربر فاکتور یا تراکنش مالی دارد و برای حفظ سوابق مالی حذف نمی‌شود؛ به‌جای حذف، حساب را غیرفعال کنید.',
      };
    }
    throw e;
  }
  touch();
  return { ok: true };
}

/* ───────────────────────── Wallet adjustments ───────────────────────── */

/**
 * Deposit / withdraw from a user's wallet as an admin, with an audit record
 * (wallet_transactions row) and balanceAfter snapshot.
 */
export async function adjustWallet(fd: FormData): Promise<ActionResult> {
  const session = await requireAdmin();
  const userId = toBigInt(fd.get('userId'));
  if (!userId) return { ok: false, message: 'کاربر یافت نشد.' };

  const type = fd.get('type') === 'withdraw' ? 'withdraw' : 'deposit';
  const amount = toAmount(fd.get('amount'));
  if (amount <= 0) return { ok: false, message: 'مبلغ باید بزرگ‌تر از صفر باشد.' };
  const description = clean(fd.get('description')) ?? 'ویرایش دستی توسط مدیریت';

  const result = await prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.upsert({
      where: { userId },
      create: { userId, balance: 0 },
      update: {},
    });

    const newBalance =
      type === 'deposit' ? wallet.balance + amount : wallet.balance - amount;
    if (newBalance < 0) {
      return null;
    }

    await tx.wallet.update({ where: { userId }, data: { balance: newBalance } });
    await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        userId,
        adminId: BigInt(session.id),
        type,
        amount,
        balanceAfter: newBalance,
        description,
      },
    });
    return newBalance;
  });

  if (result === null) {
    return { ok: false, message: 'موجودی کیف‌پول برای برداشت کافی نیست.' };
  }

  touch();
  return { ok: true, message: `موجودی جدید: ${result.toLocaleString('fa-IR')} تومان` };
}

/* ───────────────────────── Enrollments ───────────────────────── */

export async function grantEnrollment(fd: FormData): Promise<ActionResult> {
  const session = await requireAdmin();
  const userId = toBigInt(fd.get('userId'));
  const courseId = toBigInt(fd.get('courseId'));
  if (!userId || !courseId) return { ok: false, message: 'انتخاب کاربر و دوره الزامی است.' };

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (existing && existing.status === 'active') {
    return { ok: false, message: 'کاربر از قبل در این دوره ثبت‌نام دارد.' };
  }

  const expiresRaw = clean(fd.get('expiresAt'));
  // A date-only value means "until the end of that day" (business timezone).
  const expiresAt = expiresRaw ? parseLocalInputValue(expiresRaw) : null;
  if (expiresRaw && !expiresAt) {
    return { ok: false, message: 'تاریخ انقضا معتبر نیست.' };
  }

  try {
    if (existing) {
      await prisma.enrollment.update({
        where: { id: existing.id },
        data: { status: 'active', grantedBy: BigInt(session.id), startsAt: new Date(), expiresAt },
      });
    } else {
      await prisma.enrollment.create({
        data: {
          userId,
          courseId,
          status: 'active',
          grantedBy: BigInt(session.id),
          expiresAt,
        },
      });
    }
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { ok: false, message: 'کاربر از قبل ثبت‌نام دارد.' };
    }
    throw e;
  }

  touch();
  return { ok: true };
}

export async function updateEnrollment(fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = toBigInt(fd.get('id'));
  if (!id) return { ok: false, message: 'ثبت‌نام یافت نشد.' };

  const raw = String(fd.get('status') ?? '');
  if (raw !== 'active' && raw !== 'expired' && raw !== 'revoked') {
    return { ok: false, message: 'وضعیت معتبر نیست.' };
  }
  // completedAt tracks course completion, not access changes, so it is left as is.
  await prisma.enrollment.update({ where: { id }, data: { status: raw } });

  touch();
  return { ok: true };
}

export async function deleteEnrollment(enrollmentId: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.enrollment.delete({ where: { id: BigInt(enrollmentId) } });
  touch();
  return { ok: true };
}
