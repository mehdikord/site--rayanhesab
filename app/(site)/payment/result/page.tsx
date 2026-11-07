import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { prisma } from '@/app/lib/prisma';
import { Container } from '@/app/components/ui/Section';
import { formatPrice } from '@/app/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'نتیجه پرداخت',
  robots: { index: false, follow: false },
};

export default async function PaymentResultPage({
  searchParams,
}: {
  searchParams: Promise<{ invoice?: string }>;
}) {
  const { invoice: number } = await searchParams;
  const invoice =
    typeof number === 'string' && /^[A-Z0-9-]{4,50}$/.test(number)
      ? await prisma.invoice.findUnique({
          where: { number },
          select: {
            number: true,
            status: true,
            total: true,
            paidAt: true,
            items: { select: { title: true, course: { select: { slug: true } } }, take: 1 },
            transactions: {
              where: { status: 'success' },
              select: { referenceId: true },
              take: 1,
            },
          },
        })
      : null;

  const item = invoice?.items[0];
  const courseHref = item?.course?.slug ? `/courses/${item.course.slug}` : '/courses';
  const paid = invoice?.status === 'paid';
  const pending = invoice?.status === 'pending';

  const tone = paid
    ? { box: 'border-emerald-200 bg-emerald-50', icon: 'bg-emerald-500', title: 'text-emerald-900', text: 'text-emerald-800' }
    : pending
      ? { box: 'border-amber-200 bg-amber-50', icon: 'bg-amber-500', title: 'text-amber-900', text: 'text-amber-800' }
      : { box: 'border-red-200 bg-red-50', icon: 'bg-red-500', title: 'text-red-900', text: 'text-red-800' };
  const Icon = paid ? CheckCircle2 : pending ? Clock : XCircle;

  return (
    <div className="bg-cloud-100 pb-20 pt-[100px]">
      <Container className="max-w-2xl">
        <div className={`rounded-[30px] border p-8 text-center sm:p-12 ${tone.box}`} role="status">
          <span className={`mx-auto grid h-20 w-20 place-items-center rounded-full text-white ${tone.icon}`}>
            <Icon className="h-10 w-10" aria-hidden="true" />
          </span>
          <h1 className={`mt-6 text-2xl font-black ${tone.title}`}>
            {!invoice
              ? 'سفارش یافت نشد'
              : paid
                ? 'پرداخت با موفقیت انجام شد'
                : pending
                  ? 'پرداخت در انتظار تأیید است'
                  : 'پرداخت انجام نشد'}
          </h1>
          <p className={`mx-auto mt-3 max-w-md text-[14px] leading-8 ${tone.text}`}>
            {!invoice
              ? 'اطلاعات این پرداخت پیدا نشد. اگر مبلغی از حساب شما کسر شده، با پشتیبانی تماس بگیرید.'
              : paid
                ? `ثبت‌نام شما در «${item?.title ?? 'دوره'}» انجام شد. کارشناسان ما برای دسترسی به دوره با شما تماس می‌گیرند.`
                : pending
                  ? 'نتیجه پرداخت هنوز از درگاه دریافت نشده است. چند دقیقه بعد این صفحه را دوباره باز کنید.'
                  : 'پرداخت لغو شد یا تأیید نشد. اگر مبلغی کسر شده باشد، طی ۷۲ ساعت توسط بانک به حساب شما بازمی‌گردد.'}
          </p>

          {invoice ? (
            <dl className="mx-auto mt-8 max-w-md space-y-3 rounded-2xl border border-white/60 bg-white p-5 text-right text-[13px]">
              <div className="flex items-center justify-between">
                <dt className="text-ink-500">شماره سفارش</dt>
                <dd className="font-bold text-navy-900" dir="ltr">{invoice.number}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink-500">مبلغ</dt>
                <dd className="font-black text-navy-900">{formatPrice(invoice.total)} تومان</dd>
              </div>
              {invoice.transactions[0]?.referenceId ? (
                <div className="flex items-center justify-between">
                  <dt className="text-ink-500">کد پیگیری</dt>
                  <dd className="font-bold text-navy-900" dir="ltr">{invoice.transactions[0].referenceId}</dd>
                </div>
              ) : null}
            </dl>
          ) : null}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {invoice && !paid && !pending && item?.course?.slug ? (
              <Link
                href={`/courses/${item.course.slug}/checkout`}
                className="rounded-full bg-navy-900 px-7 py-3.5 text-[13.5px] font-bold text-white transition-colors hover:bg-brand-600"
              >
                تلاش دوباره
              </Link>
            ) : null}
            <Link
              href={courseHref}
              className="rounded-full border border-cloud-300 bg-white px-7 py-3.5 text-[13.5px] font-bold text-navy-900 transition-colors hover:bg-cloud-200"
            >
              بازگشت به دوره
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-cloud-300 bg-white px-7 py-3.5 text-[13.5px] font-bold text-navy-900 transition-colors hover:bg-cloud-200"
            >
              پشتیبانی
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
