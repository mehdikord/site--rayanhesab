'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/app/lib/prisma';
import { parseLocalInputValue } from '@/app/lib/datetime';
import { requireAdmin } from '@/app/admins/lib/auth';
import type { ActionResult } from '@/app/admins/_components/Confirm';
import { Prisma, type CouponType } from '@prisma/client';

function toBigInt(v: string | FormDataEntryValue | null): bigint | undefined {
  const s = String(v ?? '').trim();
  return s === '' ? undefined : BigInt(s);
}
function toOptInt(v: string | FormDataEntryValue | null): number | null {
  const s = String(v ?? '').trim();
  if (s === '') return null;
  const n = Number(s);
  return Number.isNaN(n) ? null : Math.max(0, Math.trunc(n));
}
function clean(s: string | FormDataEntryValue | null): string | null {
  const t = String(s ?? '').trim();
  return t === '' ? null : t;
}
/** datetime-local value (business timezone) → Date. */
function toDateTime(v: string | FormDataEntryValue | null): Date | null {
  return parseLocalInputValue(String(v ?? ''));
}

export async function upsertCoupon(fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = toBigInt(fd.get('id'));

  const code = String(fd.get('code') ?? '').trim().toUpperCase();
  if (!code) return { ok: false, message: 'کد کوپن الزامی است.' };

  if (!/^[A-Z0-9_-]{2,100}$/.test(code)) {
    return { ok: false, message: 'کد کوپن فقط می‌تواند شامل حروف انگلیسی، عدد، - و _ باشد.' };
  }

  const type: CouponType = fd.get('type') === 'fixed' ? 'fixed' : 'percent';
  const value = toOptInt(fd.get('value'));
  if (value === null || value <= 0) return { ok: false, message: 'مقدار کوپن باید بزرگ‌تر از صفر باشد.' };
  if (type === 'percent' && value > 100) {
    return { ok: false, message: 'درصد تخفیف نمی‌تواند بیشتر از ۱۰۰ باشد.' };
  }
  const startsAt = toDateTime(fd.get('startsAt'));
  const expiresAt = toDateTime(fd.get('expiresAt'));
  if (startsAt && expiresAt && expiresAt <= startsAt) {
    return { ok: false, message: 'تاریخ انقضا باید بعد از تاریخ شروع باشد.' };
  }

  const data = {
    code,
    title: clean(fd.get('title')),
    type,
    value,
    maxDiscount: toOptInt(fd.get('maxDiscount')),
    minOrderAmount: toOptInt(fd.get('minOrderAmount')),
    usageLimit: toOptInt(fd.get('usageLimit')),
    usageLimitPerUser: toOptInt(fd.get('usageLimitPerUser')),
    startsAt,
    expiresAt,
    isActive: fd.get('isActive') === '1',
  };

  try {
    if (id) {
      await prisma.coupon.update({ where: { id }, data });
    } else {
      await prisma.coupon.create({ data });
    }
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { ok: false, message: 'این کد قبلاً ثبت شده است.' };
    }
    throw e;
  }

  revalidatePath('/admins/coupons');
  revalidatePath('/');
  return { ok: true };
}

export async function deleteCoupon(couponId: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.coupon.delete({ where: { id: BigInt(couponId) } });
  revalidatePath('/admins/coupons');
  revalidatePath('/');
  return { ok: true };
}

/** Apply / update the list of courses a coupon is usable on. */
export async function saveCouponCourses(fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const couponId = toBigInt(fd.get('couponId'));
  if (!couponId) return { ok: false, message: 'کوپن یافت نشد.' };

  const wanted: bigint[] = [];
  for (const [key, value] of fd.entries()) {
    if (key.startsWith('course:') && value === '1') wanted.push(BigInt(key.slice(7)));
  }

  await prisma.$transaction([
    prisma.couponCourse.deleteMany({ where: { couponId } }),
    prisma.couponCourse.createMany({
      data: wanted.map((cid) => ({ couponId, courseId: cid })),
    }),
  ]);

  revalidatePath('/admins/coupons');
  return { ok: true };
}
