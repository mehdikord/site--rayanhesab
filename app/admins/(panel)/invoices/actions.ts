'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/app/lib/prisma';
import { requireAdmin } from '@/app/admins/lib/auth';
import type { ActionResult } from '@/app/admins/_components/Confirm';
import type { InvoiceStatus, TransactionStatus } from '@prisma/client';
import { fulfillInvoice, recalcInvoice, unfulfillInvoice } from '@/app/lib/commerce';

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
function toOptInt(v: string | FormDataEntryValue | null): number | null {
  const s = String(v ?? '').trim();
  if (s === '') return null;
  const n = Number(s);
  return Number.isNaN(n) ? null : Math.max(0, Math.trunc(n));
}

function touch() {
  revalidatePath('/admins/invoices');
  revalidatePath('/admins');
}

const INVOICE_STATUSES: InvoiceStatus[] = [
  'pending',
  'paid',
  'failed',
  'cancelled',
  'refunded',
];

export async function updateInvoice(fd: FormData): Promise<ActionResult> {
  const session = await requireAdmin();
  const id = toBigInt(fd.get('id'));
  if (!id) return { ok: false, message: 'فاکتور یافت نشد.' };

  const status = String(fd.get('status') ?? 'pending') as InvoiceStatus;
  if (!INVOICE_STATUSES.includes(status)) return { ok: false, message: 'وضعیت معتبر نیست.' };

  const current = await prisma.invoice.findUnique({ where: { id }, select: { status: true } });
  if (!current) return { ok: false, message: 'فاکتور یافت نشد.' };

  await prisma.$transaction(async (tx) => {
    await tx.invoice.update({
      where: { id },
      data: {
        note: clean(fd.get('note')),
        billingName: clean(fd.get('billingName')) ?? undefined,
        billingMobile: clean(fd.get('billingMobile')) ?? undefined,
        billingEmail: clean(fd.get('billingEmail')),
        billingNationalCode: clean(fd.get('billingNationalCode')),
      },
    });

    if (status === current.status) return;
    if (status === 'paid') {
      // Manual confirmation (e.g. card-to-card): grant the courses too.
      await fulfillInvoice(tx, id, { adminId: BigInt(session.id) });
    } else if (current.status === 'paid') {
      // Refund / cancel of a paid invoice: revoke access, release the coupon.
      await unfulfillInvoice(tx, id, status);
      await tx.invoice.update({ where: { id }, data: { paidAt: null } });
    } else {
      await tx.invoice.update({ where: { id }, data: { status } });
    }
  });

  touch();
  return { ok: true };
}

export async function deleteInvoice(invoiceId: string): Promise<ActionResult> {
  await requireAdmin();
  const id = BigInt(invoiceId);
  const inv = await prisma.invoice.findUnique({ where: { id }, select: { status: true } });
  if (!inv) return { ok: true };
  if (inv.status === 'paid') {
    return { ok: false, message: 'فاکتور پرداخت‌شده قابل حذف نیست؛ ابتدا وضعیت آن را به «استرداد» یا «لغو» تغییر دهید.' };
  }
  await prisma.invoice.delete({ where: { id } });
  touch();
  return { ok: true };
}

/* ───────────────────────── Invoice items ───────────────────────── */

export async function upsertInvoiceItem(fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = toBigInt(fd.get('id'));
  const invoiceId = toBigInt(fd.get('invoiceId'));
  if (!invoiceId) return { ok: false, message: 'فاکتور یافت نشد.' };

  const title = clean(fd.get('title'));
  if (!title) return { ok: false, message: 'عنوان کالا الزامی است.' };

  const courseId = toBigInt(fd.get('courseId')) ?? null;
  const originalPrice = toOptInt(fd.get('originalPrice'));
  const unitPrice = toAmount(fd.get('unitPrice'));
  const quantity = Math.max(1, toAmount(fd.get('quantity')) || 1);

  const data = {
    title,
    courseId,
    originalPrice,
    unitPrice,
    quantity,
    total: unitPrice * quantity,
  };

  await prisma.$transaction(async (tx) => {
    if (id) {
      await tx.invoiceItem.update({ where: { id, invoiceId }, data });
    } else {
      await tx.invoiceItem.create({ data: { ...data, invoiceId } });
    }
    await recalcInvoice(tx, invoiceId);
  });

  touch();
  return { ok: true };
}

export async function deleteInvoiceItem(itemId: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.$transaction(async (tx) => {
    const item = await tx.invoiceItem.delete({ where: { id: BigInt(itemId) } });
    await recalcInvoice(tx, item.invoiceId);
  });
  touch();
  return { ok: true };
}

/* ───────────────────────── Transactions ───────────────────────── */

const TX_STATUSES: TransactionStatus[] = [
  'pending',
  'success',
  'failed',
  'cancelled',
  'refunded',
];

export async function updateTransaction(fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = toBigInt(fd.get('id'));
  if (!id) return { ok: false, message: 'تراکنش یافت نشد.' };

  const status = String(fd.get('status') ?? 'pending') as TransactionStatus;
  if (!TX_STATUSES.includes(status)) return { ok: false, message: 'وضعیت معتبر نیست.' };

  const current = await prisma.transaction.findUnique({ where: { id }, select: { status: true, paidAt: true } });
  if (!current) return { ok: false, message: 'تراکنش یافت نشد.' };

  await prisma.transaction.update({
    where: { id },
    data: {
      status,
      authority: clean(fd.get('authority')),
      referenceId: clean(fd.get('referenceId')),
      // Keep the original payment time when only other fields change.
      paidAt: status === 'success' ? (current.paidAt ?? new Date()) : null,
    },
  });

  touch();
  return { ok: true };
}
