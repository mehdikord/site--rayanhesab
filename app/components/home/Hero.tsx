'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShieldCheck, TrendingUp, Users, ArrowUpLeft, BadgeCheck } from 'lucide-react';
import { ButtonLink } from '@/app/components/ui/Button';
import { SplitText } from '@/app/components/ui/effects/SplitText';
import { Aurora } from '@/app/components/ui/effects/Aurora';

const stats = [
  { value: '۱۲+', label: 'سال تجربه تخصصی' },
  { value: '۳۰۰+', label: 'کسب‌وکار همراه' },
  { value: '۹۸٪', label: 'رضایت کارفرمایان' },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy-950 pt-[68px] text-white">
      <Aurora />
      <div className="pointer-events-none absolute inset-0 ledger-grid opacity-40" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-navy-950 to-transparent" aria-hidden="true" />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-12 lg:gap-8 lg:py-24">
        <div className="lg:col-span-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[12.5px] font-semibold text-brand-200 backdrop-blur"
          >
            <BadgeCheck className="h-4 w-4 text-brand-300" aria-hidden="true" />
            مشاور مالی، حسابداری و مالیاتی حرفه‌ای
          </motion.div>

          <h1 className="mt-6 text-balance text-[30px] font-black leading-[1.4] sm:text-[42px] sm:leading-[1.3] lg:text-[52px] lg:leading-[1.28]">
            <SplitText text="با اطمینان تصمیم بگیرید؛" />
            <br />
            <span className="text-brand-300">
              <SplitText text="با دانش مالی رشد کنید." delay={0.35} />
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mt-7 max-w-xl text-[15px] leading-9 text-white/70 sm:text-base"
          >
            از خدمات تخصصی حسابداری و امور مالیاتی تا آموزش حرفه‌ای و جذب نیروی متخصص؛ همراه مطمئن کسب‌وکار شما در مسیر رشد مالی.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.75 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
          >
            <ButtonLink href="/consultation" variant="on-dark" size="lg" fullWidthOnMobile>
              درخواست مشاوره رایگان
              <ArrowUpLeft className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
            <ButtonLink
              href="/services"
              size="lg"
              className="border border-white/15 bg-white/5 text-white hover:bg-white/10"
              variant="ghost"
              fullWidthOnMobile
            >
              مشاهده خدمات
            </ButtonLink>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.95 }}
            className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-white/10 pt-7"
          >
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="text-2xl font-black text-white sm:text-3xl">{s.value}</dt>
                <dd className="mt-1 text-[12px] leading-5 text-white/50">{s.label}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative lg:col-span-6"
        >
          <div className="relative mx-auto max-w-[560px]">
            <div className="img-frame relative aspect-[5/6] overflow-hidden rounded-[36px] border border-white/10 shadow-hero sm:aspect-[4/5]">
              <Image
                src="/images/unsplash-1600880292203-757bb62b4baf-1200.jpg"
                alt="جلسه مشاوره مالی تیم رایان با مدیران کسب‌وکار"
                fill
                sizes="(max-width: 1024px) 90vw, 560px"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 via-transparent to-transparent" />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.1 }}
              className="absolute -bottom-6 right-4 w-[230px] rounded-[24px] border border-white/12 bg-navy-900/80 p-5 shadow-hero backdrop-blur-xl sm:right-[-28px]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] font-semibold text-white/60">روند رشد مالی</span>
                <TrendingUp className="h-4 w-4 text-emerald-400" aria-hidden="true" />
              </div>
              <div className="mt-4 flex items-end gap-1.5" aria-hidden="true">
                {[38, 54, 46, 68, 60, 82, 96].map((h, i) => (
                  <motion.span
                    key={i}
                    initial={{ height: 4 }}
                    animate={{ height: `${h * 0.5}px` }}
                    transition={{ duration: 0.8, delay: 1.2 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    className="w-3 rounded-t-md bg-gradient-to-t from-brand-600 to-brand-400"
                  />
                ))}
              </div>
              <p className="mt-3 text-[11.5px] text-white/50">نمای کلی از شاخص‌های مالی</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 1.25 }}
              className="absolute -left-3 top-8 flex items-center gap-3 rounded-[20px] border border-white/12 bg-white/95 px-4 py-3 shadow-hero sm:left-[-30px]"
            >
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[12.5px] font-bold text-navy-900">گزارش‌های قابل اتکا</p>
                <p className="text-[11px] text-ink-500">مطابق استانداردها</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 1.35 }}
              className="absolute -right-2 bottom-24 flex items-center gap-2 rounded-full border border-white/12 bg-navy-900/85 px-4 py-2.5 shadow-hero backdrop-blur-xl sm:right-[-20px]"
            >
              <Users className="h-4 w-4 text-brand-300" aria-hidden="true" />
              <span className="text-[12px] font-semibold text-white">جذب حسابدار متخصص</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
