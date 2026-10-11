'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Phone, MessageSquare, ChevronDown, CheckCircle, AlertCircle, X } from 'lucide-react';
import { cn, formatPrice } from '@/app/lib/utils';

export function ConsultationForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  const validate = (field?: string) => {
    const newErrors: Record<string, string> = {};
    if (!field || field === 'name') {
      if (!formData.name.trim()) newErrors.name = 'نام کامل الزامی است';
    }
    if (!field || field === 'phone') {
      if (!formData.phone.trim()) newErrors.phone = 'شماره موبایل الزامی است';
      else if (!/^09\d{9}$/.test(formData.phone.replace(/\s/g, ''))) newErrors.phone = 'فرمت شماره موبایل صحیح نیست (مثال: 09123456789)';
    }
    if (!field || field === 'service') {
      if (!formData.service) newErrors.service = 'انتخاب خدمت الزامی است';
    }
    if (!field || field === 'message') {
      if (!formData.message.trim()) newErrors.message = 'توضیحات الزامی است';
    }
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="relative rounded-[28px] border-2 border-emerald-500/50 bg-emerald-50 p-8 text-center" role="status">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500">
          <CheckCircle className="h-9 w-9 text-white" aria-hidden="true" />
        </div>
        <h3 className="mt-5 text-xl font-extrabold text-emerald-900">درخواست شما ثبت شد</h3>
        <p className="mt-2 text-emerald-700">تیم ما در اسرع وقت با شما تماس خواهد گرفت.</p>
        <p className="mt-1 text-sm text-emerald-600">(این یک نمایش است و اطلاعات واقعی ارسال نشده است.)</p>
        <button
          onClick={() => { setSubmitted(false); setFormData({ name: '', phone: '', service: '', message: '' }); setStep(1); }}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-600"
        >
          درخواست جدید
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    );
  }

  const services = [
    { value: '', label: 'یک خدمت را انتخاب کنید' },
    { value: 'accounting-auditing', label: 'حسابداری و حسابرسی' },
    { value: 'tax-services', label: 'خدمات مالیاتی' },
    { value: 'financial-consulting', label: 'مشاوره مالی و کسب‌وکار' },
    { value: 'accounting-education', label: 'آموزش تخصصی حسابداری' },
    { value: 'talent-matching', label: 'جذب و معرفی حسابدار' },
    { value: 'business-financial-services', label: 'خدمات مالی سفارشی' },
  ];

  const steps = [
    { label: 'اطلاعات تماس', icon: <Phone className="h-4 w-4" /> },
    { label: 'نوع خدمت', icon: <Mail className="h-4 w-4" /> },
    { label: 'توضیحات', icon: <MessageSquare className="h-4 w-4" /> },
  ];

  return (
    <div className="rounded-[28px] border border-cloud-300 bg-white p-6 sm:p-8 shadow-card">
      <div className="flex items-center justify-between gap-4">
        <ol className="flex items-center gap-2" role="list" aria-label="مراحل فرم">
          {steps.map((s, i) => (
            <li key={i} className="flex items-center gap-2">
              <span
                className={cn(
                  'grid h-8 w-8 place-items-center rounded-full text-[12px] font-bold transition-all',
                  i + 1 < step ? 'bg-emerald-500 text-white' : i + 1 === step ? 'bg-navy-900 text-white' : 'bg-cloud-100 text-ink-400',
                )}
              >
                {i + 1 < step ? <CheckCircle className="h-5 w-5" /> : i + 1}
              </span>
              {i < steps.length - 1 && <span className="hidden w-16 sm:block h-px bg-cloud-300" />}
            </li>
          ))}
        </ol>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
        {step === 1 && (
          <>
            <div>
              <label htmlFor="name" className="block text-[14px] font-semibold text-navy-900">نام کامل *</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={() => validate('name')}
                className={cn(
                  'mt-2 w-full rounded-[14px] border bg-white px-4 py-3.5 text-[14px] transition-colors',
                  errors.name ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : 'border-cloud-300 focus:border-brand-500 focus:ring-brand-500/20',
                )}
                placeholder="مثال: علی احمدی"
                aria-invalid={errors.name ? 'true' : 'false'}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && <p id="name-error" className="mt-1.5 flex items-center gap-1.5 text-[13px] text-red-600"><AlertCircle className="h-4 w-4" /> {errors.name}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="block text-[14px] font-semibold text-navy-900">شماره موبایل *</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleChange}
                onBlur={() => validate('phone')}
                className={cn(
                  'mt-2 w-full rounded-[14px] border bg-white px-4 py-3.5 text-[14px] transition-colors',
                  errors.phone ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : 'border-cloud-300 focus:border-brand-500 focus:ring-brand-500/20',
                )}
                placeholder="مثال: 09123456789"
                dir="ltr"
                aria-invalid={errors.phone ? 'true' : 'false'}
                aria-describedby={errors.phone ? 'phone-error' : undefined}
              />
              {errors.phone && <p id="phone-error" className="mt-1.5 flex items-center gap-1.5 text-[13px] text-red-600"><AlertCircle className="h-4 w-4" /> {errors.phone}</p>}
            </div>
          </>
        )}

        {step === 2 && (
          <div>
            <label htmlFor="service" className="block text-[14px] font-semibold text-navy-900">نوع خدمت مورد نظر *</label>
            <div className="mt-2 relative">
              <select
                id="service"
                name="service"
                value={formData.service}
                onChange={handleChange}
                onBlur={() => validate('service')}
                className={cn(
                  'appearance-none w-full rounded-[14px] border bg-white px-4 py-3.5 pr-10 text-[14px] transition-colors',
                  errors.service ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : 'border-cloud-300 focus:border-brand-500 focus:ring-brand-500/20',
                )}
                aria-invalid={errors.service ? 'true' : 'false'}
              >
                {services.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400 pointer-events-none" aria-hidden="true" />
            </div>
            {errors.service && <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-red-600"><AlertCircle className="h-4 w-4" /> {errors.service}</p>}
          </div>
        )}

        {step === 3 && (
          <div>
            <label htmlFor="message" className="block text-[14px] font-semibold text-navy-900">توضیحات و نیاز شما *</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              onBlur={() => validate('message')}
              rows={4}
              className={cn(
                'mt-2 w-full rounded-[14px] border bg-white px-4 py-3.5 text-[14px] transition-colors resize-none',
                errors.message ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : 'border-cloud-300 focus:border-brand-500 focus:ring-brand-500/20',
              )}
              placeholder="مختصراً درباره نیاز مالی خود توضیح دهید..."
              aria-invalid={errors.message ? 'true' : 'false'}
              aria-describedby={errors.message ? 'message-error' : undefined}
            />
            {errors.message && <p id="message-error" className="mt-1.5 flex items-center gap-1.5 text-[13px] text-red-600"><AlertCircle className="h-4 w-4" /> {errors.message}</p>}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((p) => p - 1)}
              className="flex-1 rounded-full border border-cloud-300 py-3.5 text-[14px] font-bold text-ink-600 hover:bg-cloud-100"
            >
              قبلی
            </button>
          )}
          {step < steps.length ? (
            <button
              type="button"
              onClick={() => { validate(); if (!errors.name && !errors.phone && (step !== 2 || formData.service) && (step !== 3 || formData.message)) setStep((p) => p + 1); }}
              className="flex-1 rounded-full bg-navy-900 py-3.5 text-[14px] font-bold text-white hover:bg-brand-600 disabled:opacity-60"
            >
              بعدی
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-full bg-navy-900 py-3.5 text-[14px] font-bold text-white hover:bg-brand-600 disabled:opacity-60"
            >
              {submitting ? 'در حال ارسال...' : 'ثبت درخواست'}
            </button>
          )}
        </div>
        <p className="text-center text-[12px] text-ink-400">
          با ثبت درخواست، شما با <a href="/about" className="underline text-brand-600 hover:text-brand-700">قوانین و حریم خصوصی</a> موافقت می‌کنید.
          <br />این فرم یک نمایش است و اطلاعات به سرور ارسال نمی‌شود.
        </p>
      </form>
    </div>
  );
}