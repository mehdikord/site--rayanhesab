import { prisma } from '@/app/lib/prisma';
import { PageTitle, Card, CardHeader } from '@/app/admins/_components/kit';
import { InvoicesManager, type InvoiceRow, type CourseOption } from './_InvoicesManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'فاکتورها' };

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? '').trim();

  const invoices = await prisma.invoice.findMany({
    where: q
      ? {
          OR: [
            { number: { contains: q } },
            { billingName: { contains: q } },
            { billingMobile: { contains: q } },
            { couponCode: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: {
      user: { select: { name: true, mobile: true } },
      coupon: { select: { code: true } },
      items: { orderBy: { id: 'asc' } },
      transactions: { orderBy: { createdAt: 'desc' } },
      enrollments: {
        select: { id: true, course: { select: { title: true } }, status: true },
      },
      walletTransactions: { select: { id: true, type: true, amount: true } },
    },
  });

  const courses = await prisma.course.findMany({
    orderBy: { title: 'asc' },
    select: { id: true, title: true },
  });

  const rows: InvoiceRow[] = invoices.map((inv) => ({
    id: String(inv.id),
    number: inv.number,
    userName: inv.user.name,
    userMobile: inv.user.mobile,
    status: inv.status,
    paymentMethod: inv.paymentMethod,
    subtotal: inv.subtotal,
    discountAmount: inv.discountAmount,
    couponCode: inv.coupon?.code ?? inv.couponCode,
    taxRate: inv.taxRate.toFixed(2),
    taxAmount: inv.taxAmount,
    total: inv.total,
    billingName: inv.billingName,
    billingMobile: inv.billingMobile,
    billingEmail: inv.billingEmail,
    billingNationalCode: inv.billingNationalCode,
    note: inv.note,
    paidAt: inv.paidAt?.toISOString() ?? null,
    createdAt: inv.createdAt.toISOString(),
    items: inv.items.map((it) => ({
      id: String(it.id),
      title: it.title,
      originalPrice: it.originalPrice,
      unitPrice: it.unitPrice,
      quantity: it.quantity,
      total: it.total,
      courseId: it.courseId !== null ? String(it.courseId) : null,
    })),
    transactions: inv.transactions.map((t) => ({
      id: String(t.id),
      type: t.type,
      gateway: t.gateway,
      amount: t.amount,
      status: t.status,
      authority: t.authority,
      referenceId: t.referenceId,
      description: t.description,
      paidAt: t.paidAt?.toISOString() ?? null,
      createdAt: t.createdAt.toISOString(),
    })),
    enrollments: inv.enrollments.map((e) => ({
      id: String(e.id),
      courseTitle: e.course.title,
      status: e.status,
    })),
    walletTxCount: inv.walletTransactions.length,
  }));

  const courseOptions: CourseOption[] = courses.map((c) => ({
    id: String(c.id),
    title: c.title,
  }));

  return (
    <div>
      <PageTitle
        title="فاکتورها"
        description="مدیریت فاکتورها، اقلام و تراکنش‌های درگاه"
      />
      <Card>
        <CardHeader
          title="لیست فاکتورها"
          description={`${rows.length.toLocaleString('fa-IR')} مورد (آخرین ۲۰۰)`}
        />
        <InvoicesManager rows={rows} courses={courseOptions} query={q} />
      </Card>
    </div>
  );
}
