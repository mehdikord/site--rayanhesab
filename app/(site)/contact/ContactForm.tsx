'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { CheckCircle2, Send } from 'lucide-react';
import { Field, TextInput, TextArea, SelectInput } from '@/app/components/ui/FormControls';
import { submitContactMessage } from '@/app/(site)/actions';
import { normalizeMobile } from '@/app/lib/validation';

type FormState = {
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
};

const initial: FormState = { name: '', phone: '', email: '', subject: '', message: '' };

const subjects = ['درخواست مشاوره', 'سوال درباره خدمات', 'دوره‌های آموزشی', 'جذب و استخدام', 'سایر موارد'];

export function ContactForm() {
  const [data, setData] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [apiError, setApiError] = useState('');
  const [, startTransition] = useTransition();

  const update = (key: keyof FormState, value: string) => {
    setData((p) => ({ ...p, [key]: value }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const validate = () => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!data.name.trim()) e.name = 'نام و نام خانوادگی الزامی است';
    if (!normalizeMobile(data.phone)) e.phone = 'شماره موبایل معتبر وارد کنید';
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = 'ایمیل معتبر وارد کنید';
    if (!data.subject) e.subject = 'موضوع پیام را انتخاب کنید';
    if (!data.message.trim()) e.message = 'متن پیام الزامی است';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) {
      document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }
    setSubmitting(true);
    setApiError('');
    const payload = { ...data };
    startTransition(async () => {
      const res = await submitContactMessage(payload);
      setSubmitting(false);
      if (res.ok) {
        setDone(true);
      } else {
        setApiError(res.message ?? 'خطا در ثبت پیام؛ دوباره تلاش کنید.');
      }
    });
  };

  if (done) {
    return (
      <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-8 text-center sm:p-12" role="status">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-white">
          <CheckCircle2 className="h-9 w-9" aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-xl font-black text-emerald-900">پیام شما ثبت شد</h2>
        <p className="mx-auto mt-3 max-w-md text-[13.5px] leading-8 text-emerald-800">
          پیام شما با موفقیت ثبت شد و تیم رایان در اسرع وقت با شما تماس خواهد گرفت.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/" className="rounded-full bg-emerald-600 px-6 py-3 text-[13px] font-bold text-white hover:bg-emerald-700">
            بازگشت به خانه
          </Link>
          <button
            type="button"
            onClick={() => {
              setData(initial);
              setDone(false);
            }}
            className="rounded-full border border-emerald-300 bg-white px-6 py-3 text-[13px] font-bold text-emerald-700 hover:bg-emerald-100"
          >
            ارسال پیام جدید
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="نام و نام خانوادگی" htmlFor="c-name" required error={errors.name}>
          <TextInput id="c-name" value={data.name} onChange={(e) => update('name', e.target.value)} error={!!errors.name} placeholder="مثال: علی احمدی" autoComplete="name" />
        </Field>
        <Field label="شماره موبایل" htmlFor="c-phone" required error={errors.phone}>
          <TextInput id="c-phone" value={data.phone} onChange={(e) => update('phone', e.target.value)} error={!!errors.phone} placeholder="09123456789" dir="ltr" inputMode="tel" autoComplete="tel" />
        </Field>
        <Field label="ایمیل" htmlFor="c-email" hint="اختیاری" error={errors.email}>
          <TextInput id="c-email" type="email" value={data.email} onChange={(e) => update('email', e.target.value)} error={!!errors.email} placeholder="name@example.com" dir="ltr" autoComplete="email" />
        </Field>
        <Field label="موضوع پیام" htmlFor="c-subject" required error={errors.subject}>
          <SelectInput id="c-subject" value={data.subject} onChange={(e) => update('subject', e.target.value)} error={!!errors.subject}>
            <option value="">انتخاب کنید</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </SelectInput>
        </Field>
      </div>

      <Field label="متن پیام" htmlFor="c-message" required error={errors.message}>
        <TextArea id="c-message" rows={5} value={data.message} onChange={(e) => update('message', e.target.value)} error={!!errors.message} placeholder="پیام خود را بنویسید..." />
      </Field>

      <div className="flex flex-col items-start gap-4 border-t border-cloud-300 pt-6 sm:flex-row sm:items-center sm:justify-between">
        {apiError ? (
          <p className="text-[12px] leading-6 font-semibold text-red-600" role="alert">
            {apiError}
          </p>
        ) : (
          <p className="text-[12px] leading-6 text-ink-400">
            با ارسال پیام، شما با{" "}
            <Link href="/about" className="text-brand-600 underline hover:text-brand-700">قوانین و حریم خصوصی</Link> موافقت می‌کنید.
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-navy-900 px-8 py-4 text-[14px] font-bold text-white transition-colors hover:bg-brand-600 disabled:opacity-70 sm:w-auto"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          {submitting ? 'در حال ارسال...' : 'ارسال پیام'}
        </button>
      </div>
    </form>
  );
}
