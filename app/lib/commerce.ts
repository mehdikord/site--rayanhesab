/**
 * Server-only commerce rules shared by the public checkout, the payment
 * callback and the admin panel: coupon validation, invoice totals, and
 * fulfillment (enrollments + coupon usage) when an invoice becomes paid.
 *
 * All amounts are integer Toman.
 */
import { randomBytes } from 'node:crypto';
import { Prisma, type InvoicePaymentMethod, type InvoiceStatus } from '@prisma/client';
import { prisma } from '@/app/lib/prisma';
import { toFa } from '@/app/lib/utils';

type Db = Prisma.TransactionClient | typeof prisma;

/* ─────────────────────────── Coupons ─────────────────────────── */

export type CouponQuote =
  | { ok: true; couponId: bigint; code: string; discount: number; label: string }
  | { ok: false; message: string };

/**
 * Validate a coupon code for one course purchase and compute its discount.
 * `amount` is the price the coupon applies to (the course's current price).
 */
export async function quoteCoupon(
  db: Db,
  input: { code: string; courseId: bigint; amount: number; userId?: bigint | null },
): Promise<CouponQuote> {
  const code = input.code.trim().toUpperCase();
  if (!code) return { ok: false, message: 'کد تخفیف را وارد کنید.' };

  const coupon = await db.coupon.findUnique({
    where: { code },
    include: { courses: { select: { courseId: true } } },
  });
  const invalid = { ok: false as const, message: 'کد تخفیف نامعتبر است.' };
  if (!coupon || !coupon.isActive) return invalid;

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) return { ok: false, message: 'زمان استفاده از این کد هنوز شروع نشده است.' };
  if (coupon.expiresAt && coupon.expiresAt <= now) return { ok: false, message: 'مهلت استفاده از این کد تمام شده است.' };

  if (coupon.courses.length > 0 && !coupon.courses.some((c) => c.courseId === input.courseId)) {
    return { ok: false, message: 'این کد تخفیف برای این دوره قابل استفاده نیست.' };
  }
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return { ok: false, message: 'ظرفیت استفاده از این کد تکمیل شده است.' };
  }
  if (coupon.minOrderAmount !== null && input.amount < coupon.minOrderAmount) {
    return {
      ok: false,
      message: `حداقل مبلغ خرید برای این کد ${coupon.minOrderAmount.toLocaleString('fa-IR')} تومان است.`,
    };
  }
  if (coupon.usageLimitPerUser !== null && input.userId) {
    const used = await db.invoice.count({
      where: { couponId: coupon.id, userId: input.userId, status: 'paid' },
    });
    if (used >= coupon.usageLimitPerUser) {
      return { ok: false, message: 'شما قبلاً از این کد تخفیف استفاده کرده‌اید.' };
    }
  }

  let discount =
    coupon.type === 'percent'
      ? Math.round((input.amount * Math.min(coupon.value, 100)) / 100)
      : coupon.value;
  if (coupon.maxDiscount !== null) discount = Math.min(discount, coupon.maxDiscount);
  discount = Math.max(0, Math.min(discount, input.amount));

  return {
    ok: true,
    couponId: coupon.id,
    code: coupon.code,
    discount,
    label: coupon.type === 'percent' ? `${toFa(coupon.value)}٪` : 'مبلغ ثابت',
  };
}

/* ─────────────────────────── Totals ─────────────────────────── */

export interface InvoiceTotals {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
}

/** VAT is charged on the amount after discount and rounded to whole Toman. */
export function computeTotals(subtotal: number, discount: number, vatRatePercent: number): InvoiceTotals {
  const discountAmount = Math.max(0, Math.min(discount, subtotal));
  const taxable = subtotal - discountAmount;
  const taxAmount = Math.max(0, Math.round((taxable * vatRatePercent) / 100));
  return { subtotal, discountAmount, taxAmount, total: taxable + taxAmount };
}

/** Recompute an invoice's totals from its items (after an admin edits them). */
export async function recalcInvoice(db: Db, invoiceId: bigint): Promise<void> {
  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    select: { discountAmount: true, taxRate: true, items: { select: { total: true } } },
  });
  if (!invoice) return;
  const subtotal = invoice.items.reduce((acc, it) => acc + it.total, 0);
  const totals = computeTotals(subtotal, invoice.discountAmount, Number(invoice.taxRate));
  await db.invoice.update({ where: { id: invoiceId }, data: totals });
}

/** Human-friendly, hard-to-guess invoice number, e.g. RH-260107-7K3QX9. */
export function generateInvoiceNumber(): string {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  const bytes = randomBytes(6);
  const rand = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
  return `RH-${ymd}-${rand}`;
}

/* ─────────────────────────── Fulfillment ─────────────────────────── */

/**
 * Mark an invoice as paid and grant its courses. Idempotent: the status flip
 * is a conditional update, so concurrent callers (gateway callback retried,
 * admin clicking twice) fulfill it exactly once. Returns false when the
 * invoice was already paid.
 */
export async function fulfillInvoice(
  tx: Prisma.TransactionClient,
  invoiceId: bigint,
  opts: { paymentMethod?: InvoicePaymentMethod | null; adminId?: bigint | null; paidAt?: Date } = {},
): Promise<boolean> {
  const paidAt = opts.paidAt ?? new Date();
  const claimed = await tx.invoice.updateMany({
    where: { id: invoiceId, status: { not: 'paid' } },
    data: {
      status: 'paid',
      paidAt,
      ...(opts.paymentMethod !== undefined ? { paymentMethod: opts.paymentMethod } : {}),
    },
  });
  if (claimed.count === 0) return false;

  const invoice = await tx.invoice.findUniqueOrThrow({
    where: { id: invoiceId },
    select: { userId: true, couponId: true, items: { select: { courseId: true } } },
  });

  const courseIds = [...new Set(invoice.items.map((i) => i.courseId).filter((c): c is bigint => c !== null))];
  for (const courseId of courseIds) {
    await tx.enrollment.upsert({
      where: { userId_courseId: { userId: invoice.userId, courseId } },
      create: {
        userId: invoice.userId,
        courseId,
        invoiceId,
        grantedBy: opts.adminId ?? null,
        status: 'active',
        startsAt: paidAt,
      },
      update: {
        invoiceId,
        status: 'active',
        startsAt: paidAt,
        expiresAt: null,
        ...(opts.adminId ? { grantedBy: opts.adminId } : {}),
      },
    });
  }

  if (invoice.couponId) {
    await tx.coupon.update({
      where: { id: invoice.couponId },
      data: { usedCount: { increment: 1 } },
    });
  }
  return true;
}

/**
 * Undo a paid invoice's effects when it moves to a non-paid status
 * (refund/cancel by an admin): revoke its enrollments and release the coupon use.
 */
export async function unfulfillInvoice(
  tx: Prisma.TransactionClient,
  invoiceId: bigint,
  newStatus: Exclude<InvoiceStatus, 'paid'>,
): Promise<boolean> {
  const released = await tx.invoice.updateMany({
    where: { id: invoiceId, status: 'paid' },
    data: { status: newStatus },
  });
  if (released.count === 0) return false;

  await tx.enrollment.updateMany({
    where: { invoiceId, status: 'active' },
    data: { status: 'revoked' },
  });

  const invoice = await tx.invoice.findUniqueOrThrow({
    where: { id: invoiceId },
    select: { couponId: true },
  });
  if (invoice.couponId) {
    await tx.coupon.updateMany({
      where: { id: invoice.couponId, usedCount: { gt: 0 } },
      data: { usedCount: { decrement: 1 } },
    });
  }
  return true;
}
