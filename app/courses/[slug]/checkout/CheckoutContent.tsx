'use client';

import { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  CreditCard,
  Wallet,
  Tag,
  Check,
  ShieldCheck,
  Lock,
  Loader2,
  ChevronLeft,
  GraduationCap,
  Clock,
  PartyPopper,
} from 'lucide-react';
import type { Course } from '@/app/types';
import { cn, formatPrice, discountPercent, toFa } from '@/app/lib/utils';
import { Field, TextInput } from '@/app/components/ui/FormControls';

const VAT_RATE = 0.1;

type FormState = { name: string; phone: string; email: string; nationalId: string };
type Method = 'gateway' | 'wallet';

export default function CheckoutContent({ course }: { course: Course }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [data, setData] = useState<FormState>({ name: '', phone: '', email: '', nationalId: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [method, setMethod] = useState<Method>('gateway');
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);
  const orderId = useMemo(() => `RYS-${Math.floor(100000 + Math.random() * 899999)}`, []);

  const off = discountPercent(course.price, course.originalPrice);
  const base = course.price;
  const courseDiscount = course.originalPrice ? course.originalPrice - base : 0;
  const couponDiscount = couponApplied ? Math.round(base * 0.1) : 0;
  const afterDiscount = base - couponDiscount;
  const vat = Math.round(afterDiscount * VAT_RATE);
  const total = afterDiscount + vat;

  useEffect(() => {
    if (paying || done) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [paying, done]);

  const update = (key: keyof FormState, value: string) => {
    setData((p) => ({ ...p, [key]: value }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const validate = () => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!data.name.trim()) e.name = 'نام و نام خانوادگی الزامی است';
    if (!/^09\d{9}$/.test(data.phone.replace(/\s/g, ''))) e.phone = 'شماره موبایل معتبر وارد کنید';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = 'ایمیل معتبر وارد کنید';
    if (data.nationalId && !/^\d{10}$/.test(data.nationalId)) e.nationalId = 'کد ملی باید ۱۰ رقم باشد';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const applyCoupon = () => {
    setCouponError('');
    const code = coupon.trim().toUpperCase();
    if (!code) return;
    if (code === 'RAYAN10') {
      setCouponApplied(true);
    } else {
      setCouponApplied(false);
      setCouponError('کد تخفیف نامعتبر است. (کد نمونه: RAYAN10)');
    }
  };

  const goToPayment = () => {
    if (!validate()) {
      document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pay = async () => {
    setPaying(true);
    await new Promise((r) => setTimeout(r, 2200));
    setPaying(false);
    setDone(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (done) {
    return (
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="rounded-[30px] border border-emerald-200 bg-emerald-50 p-8 text-center sm:p-12" role="status">
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-500 text-white shadow-[0_16px_40px_-12px_rgba(16,185,129,0.6)]">
              <PartyPopper className="h-10 w-10" aria-hidden="true" />
            </span>
            <h1 className="mt-6 text-2xl font-black text-emerald-900">پرداخت با موفقیت انجام شد</h1>
            <p className="mx-auto mt-3 max-w-md text-[14px] leading-8 text-emerald-800">
              ثبت‌نام شما در دوره «{course.title}» با موفقیت انجام شد. این یک پرداخت نمایشی است و هیچ تراکنش واقعی صورت نگرفته است.
            </p>

            <div className="mx-auto mt-8 max-w-md rounded-2xl border border-emerald-200 bg-white p-5 text-right">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-ink-500">شماره سفارش</span>
                <span className="font-bold text-navy-900" dir="ltr">{orderId}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-[13px]">
                <span className="text-ink-500">مبلغ پرداخت‌شده</span>
                <span className="font-black text-navy-900">{formatPrice(total)} تومان</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-[13px]">
                <span className="text-ink-500">روش پرداخت</span>
                <span className="font-bold text-navy-900">{method === 'gateway' ? 'درگاه بانکی' : 'کیف پول'}</span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/courses"
                className="rounded-full bg-emerald-600 px-7 py-3.5 text-[13.5px] font-bold text-white transition-colors hover:bg-emerald-700"
              >
                بازگشت به دوره‌ها
              </Link>
              <Link
                href="/consultation"
                className="rounded-full border border-emerald-300 bg-white px-7 py-3.5 text-[13.5px] font-bold text-emerald-700 transition-colors hover:bg-emerald-100"
              >
                دریافت مشاوره آموزشی
              </Link>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-4">
          <div className="sticky top-24 rounded-[28px] border border-cloud-300 bg-white p-6 shadow-card">
            <h2 className="text-[15px] font-bold text-navy-900">دوره ثبت‌نام‌شده</h2>
            <div className="mt-4 flex gap-4">
              <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl">
                <Image src={course.image} alt={course.title} fill sizes="100px" className="object-cover" />
              </div>
              <div>
                <h3 className="line-clamp-2 text-[13.5px] font-bold leading-6 text-navy-900">{course.title}</h3>
                <p className="mt-1 text-[12px] text-ink-500">{course.instructor}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <ol className="flex items-center gap-3" aria-label="مراحل خرید">
          {[
            { n: 1, label: 'اطلاعات خریدار' },
            { n: 2, label: 'پرداخت' },
          ].map((s, i) => (
            <li key={s.n} className="flex flex-1 items-center gap-3">
              <span
                className={cn(
                  'grid h-9 w-9 shrink-0 place-items-center rounded-full text-[13px] font-bold transition-colors',
                  step > s.n
                    ? 'bg-emerald-500 text-white'
                    : step === s.n
                      ? 'bg-navy-900 text-white'
                      : 'bg-cloud-200 text-ink-400',
                )}
              >
                {step > s.n ? <Check className="h-4 w-4" aria-hidden="true" /> : toFa(s.n)}
              </span>
              <span className={cn('text-[13.5px] font-bold', step === s.n ? 'text-navy-900' : 'text-ink-400')}>
                {s.label}
              </span>
              {i === 0 && <span className="h-px flex-1 bg-cloud-300" />}
            </li>
          ))}
        </ol>

        {step === 1 ? (
          <div className="mt-6 rounded-[28px] border border-cloud-300 bg-white p-6 shadow-card sm:p-8">
            <h2 className="text-xl font-black text-navy-900">اطلاعات خریدار</h2>
            <p className="mt-2 text-[13.5px] text-ink-500">
              اطلاعات زیر برای صدور فاکتور و دسترسی به دوره استفاده می‌شود. (نمایشی)
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field label="نام و نام خانوادگی" htmlFor="ck-name" required error={errors.name}>
                <TextInput id="ck-name" value={data.name} onChange={(e) => update('name', e.target.value)} error={!!errors.name} placeholder="مثال: علی احمدی" autoComplete="name" />
              </Field>
              <Field label="شماره موبایل" htmlFor="ck-phone" required error={errors.phone}>
                <TextInput id="ck-phone" value={data.phone} onChange={(e) => update('phone', e.target.value)} error={!!errors.phone} placeholder="09123456789" dir="ltr" inputMode="tel" autoComplete="tel" />
              </Field>
              <Field label="ایمیل" htmlFor="ck-email" required error={errors.email}>
                <TextInput id="ck-email" type="email" value={data.email} onChange={(e) => update('email', e.target.value)} error={!!errors.email} placeholder="name@example.com" dir="ltr" autoComplete="email" />
              </Field>
              <Field label="کد ملی" htmlFor="ck-nid" hint="اختیاری" error={errors.nationalId}>
                <TextInput id="ck-nid" value={data.nationalId} onChange={(e) => update('nationalId', e.target.value)} error={!!errors.nationalId} placeholder="۱۰ رقم" dir="ltr" inputMode="numeric" />
              </Field>
            </div>

            <button
              type="button"
              onClick={goToPayment}
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-navy-900 py-4 text-[14px] font-bold text-white transition-colors hover:bg-brand-600 sm:w-auto sm:px-10"
            >
              ادامه و مشاهده فاکتور
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-8">
            <div className="rounded-[28px] border border-cloud-300 bg-white p-6 shadow-card sm:p-8">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-navy-900">اطلاعات خریدار</h2>
                <button type="button" onClick={() => setStep(1)} className="text-[13px] font-bold text-brand-600 hover:text-brand-700">
                  ویرایش
                </button>
              </div>
              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-[12px] text-ink-500">نام</dt>
                  <dd className="mt-1 text-[14px] font-bold text-navy-900">{data.name}</dd>
                </div>
                <div>
                  <dt className="text-[12px] text-ink-500">موبایل</dt>
                  <dd className="mt-1 text-[14px] font-bold text-navy-900" dir="ltr">{data.phone}</dd>
                </div>
                <div>
                  <dt className="text-[12px] text-ink-500">ایمیل</dt>
                  <dd className="mt-1 text-[14px] font-bold text-navy-900" dir="ltr">{data.email}</dd>
                </div>
                {data.nationalId && (
                  <div>
                    <dt className="text-[12px] text-ink-500">کد ملی</dt>
                    <dd className="mt-1 text-[14px] font-bold text-navy-900" dir="ltr">{data.nationalId}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="rounded-[28px] border border-cloud-300 bg-white p-6 shadow-card sm:p-8">
              <h2 className="text-lg font-black text-navy-900">روش پرداخت</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setMethod('gateway')}
                  aria-pressed={method === 'gateway'}
                  className={cn(
                    'flex items-center gap-4 rounded-2xl border p-5 text-right transition-colors',
                    method === 'gateway' ? 'border-brand-500 bg-brand-50' : 'border-cloud-300 hover:border-cloud-400',
                  )}
                >
                  <span className={cn('grid h-11 w-11 place-items-center rounded-xl', method === 'gateway' ? 'bg-brand-600 text-white' : 'bg-cloud-100 text-ink-500')}>
                    <CreditCard className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-[14px] font-bold text-navy-900">درگاه بانکی</span>
                    <span className="mt-0.5 block text-[12px] text-ink-500">پرداخت آنلاین با کارت بانکی</span>
                  </span>
                  {method === 'gateway' && <Check className="h-5 w-5 text-brand-600" aria-hidden="true" />}
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('wallet')}
                  aria-pressed={method === 'wallet'}
                  className={cn(
                    'flex items-center gap-4 rounded-2xl border p-5 text-right transition-colors',
                    method === 'wallet' ? 'border-brand-500 bg-brand-50' : 'border-cloud-300 hover:border-cloud-400',
                  )}
                >
                  <span className={cn('grid h-11 w-11 place-items-center rounded-xl', method === 'wallet' ? 'bg-brand-600 text-white' : 'bg-cloud-100 text-ink-500')}>
                    <Wallet className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-[14px] font-bold text-navy-900">کیف پول رایان</span>
                    <span className="mt-0.5 block text-[12px] text-ink-500">پرداخت از موجودی کیف پول</span>
                  </span>
                  {method === 'wallet' && <Check className="h-5 w-5 text-brand-600" aria-hidden="true" />}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={pay}
              disabled={paying}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 py-4 text-[14.5px] font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-80"
            >
              <Lock className="h-4 w-4" aria-hidden="true" />
              پرداخت آنلاین {formatPrice(total)} تومان
            </button>
            <p className="text-center text-[12px] text-ink-400">
              با کلیک روی پرداخت، قوانین دوره و{" "}
              <Link href="/about" className="underline hover:text-brand-600">حریم خصوصی</Link> را می‌پذیرید. این پرداخت نمایشی است.
            </p>
          </div>
        )}
      </div>

      <aside className="lg:col-span-5">
        <div className="sticky top-24 space-y-5">
          <div className="overflow-hidden rounded-[28px] border border-cloud-300 bg-white shadow-card">
            <div className="flex items-center gap-3 border-b border-cloud-200 bg-cloud-100 px-6 py-4">
              <ShieldCheck className="h-5 w-5 text-brand-600" aria-hidden="true" />
              <h2 className="text-[14.5px] font-black text-navy-900">فاکتور پرداخت</h2>
            </div>

            <div className="p-6">
              <div className="flex gap-4">
                <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl">
                  <Image src={course.image} alt={course.title} fill sizes="100px" className="object-cover" />
                </div>
                <div className="min-w-0">
                  <h3 className="line-clamp-2 text-[14px] font-extrabold leading-6 text-navy-900">{course.title}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[11.5px] text-ink-500">
                    <span className="inline-flex items-center gap-1">
                      <GraduationCap className="h-3.5 w-3.5 text-brand-500" aria-hidden="true" /> {course.instructor}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-brand-500" aria-hidden="true" /> {course.duration}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="coupon" className="flex items-center gap-1.5 text-[13px] font-semibold text-navy-900">
                  <Tag className="h-4 w-4 text-brand-500" aria-hidden="true" />
                  کد تخفیف
                </label>
                <div className="mt-2 flex gap-2">
                  <input
                    id="coupon"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="مثال: RAYAN10"
                    dir="ltr"
                    className="w-full rounded-[14px] border border-cloud-300 bg-white px-4 py-3 text-[13.5px] outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    className="shrink-0 rounded-[14px] bg-navy-900 px-5 text-[13px] font-bold text-white transition-colors hover:bg-brand-600"
                  >
                    اعمال
                  </button>
                </div>
                {couponApplied && (
                  <p className="mt-2 flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600">
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    کد تخفیف ۱۰٪ اعمال شد
                  </p>
                )}
                {couponError && <p className="mt-2 text-[12px] text-red-600">{couponError}</p>}
              </div>

              <dl className="mt-6 space-y-3 border-t border-cloud-200 pt-5 text-[13.5px]">
                <div className="flex items-center justify-between">
                  <dt className="text-ink-500">قیمت دوره</dt>
                  <dd className="font-bold text-navy-900">{formatPrice(base)} تومان</dd>
                </div>
                {courseDiscount > 0 && (
                  <div className="flex items-center justify-between">
                    <dt className="text-ink-500">تخفیف دوره{off ? ` (${toFa(off)}٪)` : ''}</dt>
                    <dd className="font-bold text-emerald-600">− {formatPrice(courseDiscount)} تومان</dd>
                  </div>
                )}
                {couponApplied && (
                  <div className="flex items-center justify-between">
                    <dt className="text-ink-500">کد تخفیف (۱۰٪)</dt>
                    <dd className="font-bold text-emerald-600">− {formatPrice(couponDiscount)} تومان</dd>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <dt className="text-ink-500">مالیات بر ارزش افزوده (۱۰٪)</dt>
                  <dd className="font-bold text-navy-900">{formatPrice(vat)} تومان</dd>
                </div>
              </dl>

              <div className="mt-5 flex items-center justify-between border-t border-cloud-200 pt-5">
                <span className="text-[14px] font-bold text-navy-900">مبلغ قابل پرداخت</span>
                <span className="text-xl font-black text-navy-900">{formatPrice(total)} تومان</span>
              </div>
            </div>

            <div className="border-t border-cloud-200 bg-cloud-100 px-6 py-4">
              <ul className="space-y-2">
                {['دسترسی همیشگی به محتوای دوره', 'پشتیبانی و پرسش و پاسخ با مدرس', 'گواهی پایان دوره (نمونه)'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[12px] text-ink-600">
                    <Check className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-[22px] border border-cloud-300 bg-white p-5">
            <Lock className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
            <p className="text-[12.5px] leading-7 text-ink-500">
              این فرایند یک خرید نمایشی است؛ هیچ تراکنش واقعی، پرداخت یا ذخیره اطلاعاتی انجام نمی‌شود.
            </p>
          </div>
        </div>
      </aside>

      {paying && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-navy-950/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="در حال پرداخت">
          <div className="w-full max-w-sm rounded-[28px] border border-cloud-300 bg-white p-8 text-center shadow-lift">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-50 text-brand-600">
              <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
            </span>
            <h3 className="mt-5 text-lg font-black text-navy-900">در حال اتصال به درگاه پرداخت</h3>
            <p className="mt-2 text-[13px] leading-7 text-ink-500">
              لطفاً صفحه را نبندید... (شبیه‌سازی درگاه بانکی)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
