'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Send } from 'lucide-react';
import { Field, TextInput, TextArea, SelectInput, FileUpload } from '@/app/components/ui/FormControls';

type FormState = {
  fullName: string;
  phone: string;
  email: string;
  position: string;
  experience: string;
  skills: string;
  employmentType: string;
  city: string;
  intro: string;
};

const initial: FormState = {
  fullName: '',
  phone: '',
  email: '',
  position: '',
  experience: '',
  skills: '',
  employmentType: '',
  city: '',
  intro: '',
};

const positions = ['حسابدار عمومی', 'حسابدار مالی', 'کارشناس حقوق و دستمزد', 'کارشناس مالیات', 'حسابرس', 'مدیر مالی'];
const employmentTypes = ['تمام‌وقت', 'پاره‌وقت', 'پروژه‌ای', 'دورکاری', 'کارآموزی'];

export function AccountantForm() {
  const [data, setData] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const update = (key: keyof FormState, value: string) => {
    setData((p) => ({ ...p, [key]: value }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const validate = () => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!data.fullName.trim()) e.fullName = 'نام و نام خانوادگی الزامی است';
    if (!/^09\d{9}$/.test(data.phone.replace(/\s/g, ''))) e.phone = 'شماره موبایل معتبر وارد کنید (مثال: 09123456789)';
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = 'ایمیل معتبر وارد کنید';
    if (!data.position) e.position = 'موقعیت شغلی مورد نظر را انتخاب کنید';
    if (!data.experience) e.experience = 'سابقه کار را انتخاب کنید';
    if (!data.skills.trim()) e.skills = 'مهارت‌های خود را وارد کنید';
    if (!data.employmentType) e.employmentType = 'نوع همکاری را انتخاب کنید';
    if (!data.city.trim()) e.city = 'شهر محل سکونت را وارد کنید';
    if (!data.intro.trim()) e.intro = 'معرفی کوتاه الزامی است';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) {
      const first = document.querySelector<HTMLElement>('[aria-invalid="true"]');
      first?.focus();
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitting(false);
    setDone(true);
  };

  if (done) {
    return (
      <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-8 text-center sm:p-12" role="status">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-white">
          <CheckCircle2 className="h-9 w-9" aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-xl font-black text-emerald-900">درخواست همکاری شما ثبت شد</h2>
        <p className="mx-auto mt-3 max-w-md text-[13.5px] leading-8 text-emerald-800">
          در این نسخه نمایشی، درخواست شما با موفقیت ثبت شد. در حالت واقعی، تیم رایان اطلاعات شما را بررسی و در فرایند تطبیق قرار می‌دهد.
        </p>
        <p className="mx-auto mt-2 max-w-md text-[12.5px] leading-7 text-emerald-700">
          توجه: هیچ اطلاعاتی به سرور ارسال یا ذخیره نشده است.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/recruitment" className="rounded-full bg-emerald-600 px-6 py-3 text-[13px] font-bold text-white hover:bg-emerald-700">
            بازگشت به صفحه جذب
          </Link>
          <button
            type="button"
            onClick={() => {
              setData(initial);
              setDone(false);
            }}
            className="rounded-full border border-emerald-300 bg-white px-6 py-3 text-[13px] font-bold text-emerald-700 hover:bg-emerald-100"
          >
            ثبت درخواست جدید
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="نام و نام خانوادگی" htmlFor="fullName" required error={errors.fullName}>
          <TextInput id="fullName" value={data.fullName} onChange={(e) => update('fullName', e.target.value)} error={!!errors.fullName} placeholder="مثال: علی احمدی" autoComplete="name" />
        </Field>
        <Field label="شماره موبایل" htmlFor="phone" required error={errors.phone}>
          <TextInput id="phone" value={data.phone} onChange={(e) => update('phone', e.target.value)} error={!!errors.phone} placeholder="09123456789" dir="ltr" inputMode="tel" autoComplete="tel" />
        </Field>
        <Field label="ایمیل" htmlFor="email" error={errors.email} hint="اختیاری">
          <TextInput id="email" type="email" value={data.email} onChange={(e) => update('email', e.target.value)} error={!!errors.email} placeholder="name@example.com" dir="ltr" autoComplete="email" />
        </Field>
        <Field label="شهر محل سکونت" htmlFor="city" required error={errors.city}>
          <TextInput id="city" value={data.city} onChange={(e) => update('city', e.target.value)} error={!!errors.city} placeholder="مثال: تهران" />
        </Field>
        <Field label="موقعیت شغلی مورد نظر" htmlFor="position" required error={errors.position}>
          <SelectInput id="position" value={data.position} onChange={(e) => update('position', e.target.value)} error={!!errors.position}>
            <option value="">انتخاب کنید</option>
            {positions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="سابقه کار" htmlFor="experience" required error={errors.experience}>
          <SelectInput id="experience" value={data.experience} onChange={(e) => update('experience', e.target.value)} error={!!errors.experience}>
            <option value="">انتخاب کنید</option>
            <option value="بدون سابقه">بدون سابقه</option>
            <option value="۱ تا ۳ سال">۱ تا ۳ سال</option>
            <option value="۳ تا ۵ سال">۳ تا ۵ سال</option>
            <option value="۵ تا ۱۰ سال">۵ تا ۱۰ سال</option>
            <option value="بیش از ۱۰ سال">بیش از ۱۰ سال</option>
          </SelectInput>
        </Field>
        <Field label="نوع همکاری مورد نظر" htmlFor="employmentType" required error={errors.employmentType}>
          <SelectInput id="employmentType" value={data.employmentType} onChange={(e) => update('employmentType', e.target.value)} error={!!errors.employmentType}>
            <option value="">انتخاب کنید</option>
            {employmentTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="مهارت‌های کلیدی" htmlFor="skills" required error={errors.skills} hint="با کاما جدا کنید">
          <TextInput id="skills" value={data.skills} onChange={(e) => update('skills', e.target.value)} error={!!errors.skills} placeholder="نرم‌افزار سپیدار، مالیات ارزش افزوده، حقوق و دستمزد" />
        </Field>
      </div>

      <Field label="معرفی کوتاه حرفه‌ای" htmlFor="intro" required error={errors.intro}>
        <TextArea id="intro" rows={4} value={data.intro} onChange={(e) => update('intro', e.target.value)} error={!!errors.intro} placeholder="مختصراً درباره تجربه، تخصص و انتظارات شغلی خود بنویسید..." />
      </Field>

      <FileUpload label="بارگذاری رزومه" hint="اختیاری" />

      <div className="flex flex-col items-start gap-4 border-t border-cloud-300 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[12px] leading-6 text-ink-400">
          این فرم نمایشی است؛ اطلاعات ارسال یا ذخیره نمی‌شود.
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-navy-900 px-8 py-4 text-[14px] font-bold text-white transition-colors hover:bg-brand-600 disabled:opacity-70 sm:w-auto"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          {submitting ? 'در حال ارسال...' : 'ارسال درخواست همکاری'}
        </button>
      </div>
    </form>
  );
}
