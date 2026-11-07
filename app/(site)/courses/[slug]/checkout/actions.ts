'use server';

import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { prisma } from '@/app/lib/prisma';
import { getSiteSettings } from '@/app/lib/site-data';
import { EMAIL_RE, isValidNationalCode, normalizeMobile, toEnDigits } from '@/app/lib/validation';
import { clientIp, rateLimit } from '@/app/lib/rate-limit';
import { appBaseUrl } from '@/app/lib/app-url';
import {
  computeTotals,
  fulfillInvoice,
  generateInvoiceNumber,
  quoteCoupon,
} from '@/app/lib/commerce';
import { GATEWAY_NAME, gatewayConfigured, requestPayment } from '@/app/lib/payment/zarinpal';

async function publishedCourse(slug: string) {
  return prisma.course.findFirst({
    where: { slug: String(slug ?? ''), status: 'published' },
    select: { id: true, slug: true, title: true, price: true, originalPrice: true },
  });
}

/* ─────────────────────────── Coupon preview ─────────────────────────── */

export type CouponPreview =
  | { ok: true; code: string; discount: number; label: string }
  | { ok: false; message: string };

/**
 * Check a coupon for a course without revealing which codes exist. The
 * per-user limit is checked again at payment time, once the buyer is known.
 */
export async function previewCoupon(slug: string, code: string, phone?: string): Promise<CouponPreview> {
  const ip = (await clientIp()) ?? 'unknown';
  if (!rateLimit(`coupon:${ip}`, 20, 10 * 60_000)) {
    return { ok: false, message: 'تعداد تلاش‌ها زیاد است؛ کمی بعد دوباره امتحان کنید.' };
  }
  const course = await publishedCourse(slug);
  if (!course) return { ok: false, message: 'دوره یافت نشد.' };

  const mobile = phone ? normalizeMobile(phone) : null;
  const user = mobile
    ? await prisma.user.findUnique({ where: { mobile }, select: { id: true } })
    : null;

  const q = await quoteCoupon(prisma, {
    code: String(code ?? '').slice(0, 100),
    courseId: course.id,
    amount: course.price,
    userId: user?.id ?? null,
  });
  return q.ok ? { ok: true, code: q.code, discount: q.discount, label: q.label } : q;
}

/* ─────────────────────────── Start checkout ─────────────────────────── */

export interface CheckoutInput {
  slug: string;
  name: string;
  phone: string;
  email: string;
  nationalId?: string;
  coupon?: string;
}

export type CheckoutResult =
  | { ok: true; redirectUrl: string }
  | { ok: false; message: string; field?: 'name' | 'phone' | 'email' | 'nationalId' | 'coupon' };

/**
 * Create a pending invoice for the course (all prices computed here, never
 * trusted from the browser) and hand back the gateway URL. Free orders are
 * fulfilled immediately.
 */
export async function startCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  const name = String(input.name ?? '').trim().slice(0, 255);
  const mobile = normalizeMobile(String(input.phone ?? ''));
  const email = String(input.email ?? '').trim().toLowerCase().slice(0, 255);
  const nationalId = toEnDigits(String(input.nationalId ?? '').trim());
  const couponCode = String(input.coupon ?? '').trim().slice(0, 100);

  if (!name) return { ok: false, field: 'name', message: 'نام و نام خانوادگی الزامی است.' };
  if (!mobile) return { ok: false, field: 'phone', message: 'شماره موبایل معتبر وارد کنید.' };
  if (!EMAIL_RE.test(email)) return { ok: false, field: 'email', message: 'ایمیل معتبر وارد کنید.' };
  if (nationalId && !isValidNationalCode(nationalId)) {
    return { ok: false, field: 'nationalId', message: 'کد ملی معتبر نیست.' };
  }

  const ip = (await clientIp()) ?? 'unknown';
  if (!rateLimit(`checkout:${ip}`, 10, 10 * 60_000)) {
    return { ok: false, message: 'تعداد درخواست‌ها زیاد است؛ چند دقیقه بعد دوباره تلاش کنید.' };
  }

  const course = await publishedCourse(input.slug);
  if (!course) return { ok: false, message: 'این دوره در حال حاضر قابل خرید نیست.' };

  const settings = await getSiteSettings();

  // Find or create the buyer by mobile (the account identity on this site).
  let user = await prisma.user.findUnique({ where: { mobile }, select: { id: true, isActive: true } });
  if (user && !user.isActive) {
    return { ok: false, message: 'حساب کاربری شما غیرفعال است؛ با پشتیبانی تماس بگیرید.' };
  }
  if (!user) {
    const emailTaken = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    try {
      user = await prisma.user.create({
        data: { name, mobile, email: emailTaken ? null : email },
        select: { id: true, isActive: true },
      });
    } catch (e) {
      // Created concurrently by a parallel request: reuse it.
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        user = await prisma.user.findUniqueOrThrow({ where: { mobile }, select: { id: true, isActive: true } });
      } else {
        throw e;
      }
    }
  }
  const userId = user.id;

  const enrolled = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: course.id } },
    select: { status: true },
  });
  if (enrolled?.status === 'active') {
    return { ok: false, message: 'شما قبلاً در این دوره ثبت‌نام کرده‌اید.' };
  }

  let couponId: bigint | null = null;
  let discount = 0;
  if (couponCode) {
    const q = await quoteCoupon(prisma, { code: couponCode, courseId: course.id, amount: course.price, userId });
    if (!q.ok) return { ok: false, field: 'coupon', message: q.message };
    couponId = q.couponId;
    discount = q.discount;
  }

  const totals = computeTotals(course.price, discount, settings.vatRate);
  if (totals.total > 0 && !gatewayConfigured()) {
    return { ok: false, message: 'پرداخت آنلاین موقتاً در دسترس نیست؛ لطفاً بعداً تلاش کنید یا با ما تماس بگیرید.' };
  }

  const invoiceNumber = generateInvoiceNumber();
  const invoice = await prisma.$transaction(async (tx) => {
    // Earlier unpaid attempts for the same course are superseded by this one.
    await tx.invoice.updateMany({
      where: { userId, status: 'pending', items: { some: { courseId: course.id } } },
      data: { status: 'cancelled' },
    });
    return tx.invoice.create({
      data: {
        userId,
        couponId,
        couponCode: couponId ? couponCode.toUpperCase() : null,
        number: invoiceNumber,
        status: 'pending',
        paymentMethod: totals.total > 0 ? 'gateway' : null,
        ...totals,
        taxRate: new Prisma.Decimal(settings.vatRate),
        billingName: name,
        billingMobile: mobile,
        billingEmail: email,
        billingNationalCode: nationalId || null,
        items: {
          create: {
            courseId: course.id,
            title: course.title,
            originalPrice: course.originalPrice,
            unitPrice: course.price,
            quantity: 1,
            total: course.price,
          },
        },
      },
      select: { id: true, number: true, total: true },
    });
  });

  const resultUrl = `/payment/result?invoice=${encodeURIComponent(invoice.number)}`;

  if (invoice.total === 0) {
    await prisma.$transaction((tx) => fulfillInvoice(tx, invoice.id, { paymentMethod: null }));
    revalidatePath('/admins/invoices');
    return { ok: true, redirectUrl: resultUrl };
  }

  const base = await appBaseUrl();
  const pay = await requestPayment({
    amountToman: invoice.total,
    description: `خرید دوره «${course.title}» — فاکتور ${invoice.number}`,
    callbackUrl: `${base}/payment/callback`,
    mobile,
    email,
    orderId: invoice.number,
  });

  if (!pay.ok) {
    await prisma.invoice.update({ where: { id: invoice.id }, data: { status: 'failed' } });
    return { ok: false, message: pay.message };
  }

  await prisma.transaction.create({
    data: {
      userId,
      invoiceId: invoice.id,
      type: 'invoice_payment',
      gateway: GATEWAY_NAME,
      amount: invoice.total,
      status: 'pending',
      authority: pay.authority,
      description: `پرداخت فاکتور ${invoice.number}`,
    },
  });

  return { ok: true, redirectUrl: pay.redirectUrl };
}
