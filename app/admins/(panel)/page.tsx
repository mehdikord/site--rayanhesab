import {
  Users,
  GraduationCap,
  FileText,
  MessageCircle,
  Mail,
  Briefcase,
  TrendingUp,
  Wallet,
  Clock,
  Layers,
} from 'lucide-react';
import { prisma } from '@/app/lib/prisma';
import {
  Card,
  CardHeader,
  Stat,
  TableCard,
  Td,
  StatusPill,
  formatToman,
  fmtDateOnly,
  EmptyRow,
  ALinkButton,
} from '@/app/admins/_components/kit';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'داشبورد' };

function startOfMonth(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export default async function AdminDashboardPage() {
  const [
    userCount,
    courseCount,
    articleCount,
    serviceCount,
    invoiceCount,
    newConsultations,
    newMessages,
    newApplications,
    pendingInvoiceCount,
    paidTotals,
    paidThisMonth,
    recentConsultations,
    recentInvoices,
    walletTotals,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.course.count({ where: { status: 'published' } }),
    prisma.article.count({ where: { status: 'published' } }),
    prisma.service.count({ where: { isActive: true } }),
    prisma.invoice.count(),
    prisma.consultationRequest.count({ where: { status: 'new' } }),
    prisma.contactMessage.count({ where: { status: 'new' } }),
    prisma.talentApplication.count({ where: { status: 'new' } }),
    prisma.invoice.count({ where: { status: 'pending' } }),
    prisma.invoice.aggregate({ _sum: { total: true }, _count: true, where: { status: 'paid' } }),
    prisma.invoice.aggregate({
      _sum: { total: true },
      where: { status: 'paid', paidAt: { gte: startOfMonth() } },
    }),
    prisma.consultationRequest.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: { service: { select: { title: true } } },
    }),
    prisma.invoice.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, mobile: true } } },
    }),
    prisma.wallet.aggregate({ _sum: { balance: true } }),
  ]);

  const walletSum = walletTotals._sum.balance ?? 0;
  const fa = (n: number) => n.toLocaleString('fa-IR');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-black text-navy-900">داشبورد</h1>
          <p className="mt-1 text-[13px] text-ink-500">نمای کلی فروش، درخواست‌ها و محتوای سایت</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="درآمد کل (پرداخت‌شده)" value={fa(paidTotals._sum.total ?? 0)} icon={<TrendingUp className="h-5 w-5" />} hint={`تومان — ${fa(paidTotals._count)} فاکتور پرداخت‌شده`} />
        <Stat label="درآمد این ماه" value={fa(paidThisMonth._sum.total ?? 0)} icon={<TrendingUp className="h-5 w-5" />} hint="تومان (از ابتدای ماه میلادی جاری)" />
        <Stat label="فاکتورهای در انتظار" value={fa(pendingInvoiceCount)} icon={<Clock className="h-5 w-5" />} hint={`از مجموع ${fa(invoiceCount)} فاکتور`} />
        <Stat label="موجودی کل کیف‌پول‌ها" value={fa(walletSum)} icon={<Wallet className="h-5 w-5" />} hint="تومان" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="مشاوره‌های جدید" value={fa(newConsultations)} icon={<MessageCircle className="h-5 w-5" />} hint="در انتظار پیگیری" />
        <Stat label="پیام‌های جدید" value={fa(newMessages)} icon={<Mail className="h-5 w-5" />} hint="خوانده‌نشده" />
        <Stat label="درخواست‌های همکاری جدید" value={fa(newApplications)} icon={<Briefcase className="h-5 w-5" />} hint="بررسی‌نشده" />
        <Stat label="کاربران" value={fa(userCount)} icon={<Users className="h-5 w-5" />} hint="کاربران ثبت‌شده" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="دوره‌های منتشرشده" value={fa(courseCount)} icon={<GraduationCap className="h-5 w-5" />} />
        <Stat label="مقالات منتشرشده" value={fa(articleCount)} icon={<FileText className="h-5 w-5" />} />
        <Stat label="خدمات فعال" value={fa(serviceCount)} icon={<Layers className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader
            title="آخرین درخواست‌های مشاوره"
            actions={<ALinkButton href="/admins/consultations">مشاهده همه</ALinkButton>}
          />
          <TableCard columns={['نام', 'خدمات', 'وضعیت', 'تاریخ']}>
            {recentConsultations.length === 0 ? (
              <EmptyRow colSpan={4} label="درخواستی ثبت نشده است" />
            ) : (
              recentConsultations.map((c) => (
                <tr key={String(c.id)} className="hover:bg-cloud-100/60">
                  <Td>
                    <p className="font-bold text-navy-900">{c.name}</p>
                    <p className="text-[11.5px] text-ink-400" dir="ltr">{c.mobile}</p>
                  </Td>
                  <Td>{c.service?.title ?? '—'}</Td>
                  <Td><StatusPill value={c.status} /></Td>
                  <Td className="whitespace-nowrap text-ink-500">{fmtDateOnly(c.createdAt)}</Td>
                </tr>
              ))
            )}
          </TableCard>
        </Card>

        <Card>
          <CardHeader
            title="آخرین فاکتورها"
            actions={<ALinkButton href="/admins/invoices">مشاهده همه</ALinkButton>}
          />
          <TableCard columns={['کاربر', 'مبلغ', 'روش', 'وضعیت', 'تاریخ']}>
            {recentInvoices.length === 0 ? (
              <EmptyRow colSpan={5} label="فاکتوری ثبت نشده است" />
            ) : (
              recentInvoices.map((inv) => (
                <tr key={String(inv.id)} className="hover:bg-cloud-100/60">
                  <Td>
                    <p className="font-bold text-navy-900">{inv.user.name}</p>
                    <p className="text-[11.5px] text-ink-400" dir="ltr">{inv.number}</p>
                  </Td>
                  <Td className="whitespace-nowrap font-bold" dir="ltr">{formatToman(inv.total)}</Td>
                  <Td>{inv.paymentMethod === 'gateway' ? 'درگاه' : inv.paymentMethod === 'wallet' ? 'کیف‌پول' : '—'}</Td>
                  <Td><StatusPill value={inv.status} /></Td>
                  <Td className="whitespace-nowrap text-ink-500">{fmtDateOnly(inv.createdAt)}</Td>
                </tr>
              ))
            )}
          </TableCard>
        </Card>
      </div>
    </div>
  );
}
