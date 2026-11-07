import { NextResponse, type NextRequest } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/app/lib/prisma';
import { fulfillInvoice } from '@/app/lib/commerce';
import { GATEWAY_NAME, verifyPayment } from '@/app/lib/payment/zarinpal';
import { appBaseUrl } from '@/app/lib/app-url';

export const dynamic = 'force-dynamic';

/**
 * Zarinpal sends the buyer back here with ?Authority=…&Status=OK|NOK.
 * The payment is only trusted after a server-to-server verify call.
 */
export async function GET(request: NextRequest) {
  const authority = request.nextUrl.searchParams.get('Authority')?.trim() ?? '';
  const status = request.nextUrl.searchParams.get('Status') ?? '';
  const base = await appBaseUrl();
  const to = (invoiceNumber?: string) =>
    NextResponse.redirect(
      new URL(invoiceNumber ? `/payment/result?invoice=${encodeURIComponent(invoiceNumber)}` : '/payment/result', base),
      303,
    );

  if (!authority || authority.length > 255) return to();

  const txn = await prisma.transaction.findFirst({
    where: { authority, gateway: GATEWAY_NAME },
    include: { invoice: { select: { id: true, number: true, total: true, status: true } } },
  });
  if (!txn || !txn.invoice) return to();
  const invoice = txn.invoice;

  // Already settled (refresh / back button): just show the result.
  if (txn.status !== 'pending') return to(invoice.number);

  if (status !== 'OK') {
    await prisma.$transaction([
      prisma.transaction.updateMany({
        where: { id: txn.id, status: 'pending' },
        data: { status: 'cancelled' },
      }),
      prisma.invoice.updateMany({
        where: { id: invoice.id, status: 'pending' },
        data: { status: 'cancelled' },
      }),
    ]);
    return to(invoice.number);
  }

  const result = await verifyPayment({ amountToman: txn.amount, authority });

  if (!result.ok) {
    await prisma.$transaction([
      prisma.transaction.updateMany({
        where: { id: txn.id, status: 'pending' },
        data: {
          status: 'failed',
          meta: { verify: result.raw ?? null, code: result.code } as Prisma.InputJsonValue,
        },
      }),
      prisma.invoice.updateMany({
        where: { id: invoice.id, status: 'pending' },
        data: { status: 'failed' },
      }),
    ]);
    return to(invoice.number);
  }

  const paidAt = new Date();
  await prisma.$transaction(async (tx) => {
    const claimed = await tx.transaction.updateMany({
      where: { id: txn.id, status: 'pending' },
      data: {
        status: 'success',
        referenceId: result.refId,
        cardNumber: result.cardPan?.slice(0, 25) ?? null,
        paidAt,
        meta: { verify: result.raw ?? null } as Prisma.InputJsonValue,
      },
    });
    if (claimed.count === 0) return; // a concurrent callback already handled it
    // The money was taken, so the invoice is fulfilled even if it had been
    // superseded/cancelled in the meantime.
    await fulfillInvoice(tx, invoice.id, { paymentMethod: 'gateway', paidAt });
  });

  return to(invoice.number);
}
