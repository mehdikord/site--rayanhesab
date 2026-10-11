'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Clock,
  GraduationCap,
  BarChart3,
  Check,
  ChevronDown,
  PlayCircle,
  ShieldCheck,
  ShoppingCart,
  CheckCircle2,
  X,
} from 'lucide-react';
import type { Course } from '@/app/types';
import { cn, formatPrice, discountPercent, toFa } from '@/app/lib/utils';
import { Accordion } from '@/app/components/ui/Accordion';
import { Badge } from '@/app/components/ui/Badge';

export function CourseDetail({ course, related }: { course: Course; related: Course[] }) {
  const [openModule, setOpenModule] = useState<number | null>(0);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const off = discountPercent(course.price, course.originalPrice);

  const handleEnroll = () => {
    // Navigate to checkout
    window.location.href = `/courses/${course.slug}/checkout`;
  };

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <section className="rounded-[28px] border border-cloud-300 bg-white p-6 shadow-card sm:p-8">
          <h2 className="text-xl font-black text-navy-900">درباره این دوره</h2>
          <p className="mt-4 text-[14.5px] leading-9 text-ink-500">{course.description}</p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="text-[15px] font-extrabold text-navy-900">چه چیزی یاد می‌گیرید؟</h3>
              <ul className="mt-4 space-y-3">
                {course.objectives.map((o) => (
                  <li key={o} className="flex items-start gap-3 text-[13.5px] leading-7 text-ink-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                    {o}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-[15px] font-extrabold text-navy-900">این دوره برای چه کسانی است؟</h3>
              <ul className="mt-4 space-y-3">
                {course.audience.map((a) => (
                  <li key={a} className="flex items-start gap-3 text-[13.5px] leading-7 text-ink-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {course.prerequisites.length > 0 && (
            <div className="mt-8 rounded-2xl border border-cloud-300 bg-cloud-100 p-5">
              <h3 className="text-[14px] font-extrabold text-navy-900">پیش‌نیازها</h3>
              <ul className="mt-3 space-y-2">
                {course.prerequisites.map((p) => (
                  <li key={p} className="text-[13px] leading-7 text-ink-500">— {p}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="mt-8 rounded-[28px] border border-cloud-300 bg-white p-6 shadow-card sm:p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-navy-900">سرفصل‌های دوره</h2>
            <Badge tone="muted">{toFa(course.curriculum.length)} فصل</Badge>
          </div>
          <div className="mt-6 space-y-3">
            {course.curriculum.map((mod, i) => {
              const isOpen = openModule === i;
              return (
                <div key={mod.title} className="overflow-hidden rounded-2xl border border-cloud-300">
                  <button
                    type="button"
                    onClick={() => setOpenModule(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 bg-cloud-100 px-5 py-4 text-right transition-colors hover:bg-cloud-200"
                  >
                    <span className="flex items-center gap-3">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-navy-900 text-[12px] font-bold text-white">
                        {toFa(i + 1)}
                      </span>
                      <span className="text-[14px] font-bold text-navy-900">{mod.title}</span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="hidden text-[12px] text-ink-500 sm:block">{mod.duration}</span>
                      <ChevronDown className={cn('h-5 w-5 text-ink-500 transition-transform', isOpen && 'rotate-180')} aria-hidden="true" />
                    </span>
                  </button>
                  <div className={cn('grid transition-all duration-400', isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
                    <div className="overflow-hidden">
                      <ul className="space-y-2 p-5">
                        {mod.lessons.map((lesson) => (
                          <li key={lesson} className="flex items-center gap-3 text-[13.5px] text-ink-600">
                            <PlayCircle className="h-4 w-4 shrink-0 text-brand-500" aria-hidden="true" />
                            {lesson}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border border-cloud-300 bg-white p-6 shadow-card sm:p-8">
          <h2 className="text-xl font-black text-navy-900">سوالات متداول</h2>
          <div className="mt-4">
            <Accordion items={course.faqs} />
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-black text-navy-900">دوره‌های مرتبط</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/courses/${r.slug}`}
                  className="group flex gap-4 rounded-2xl border border-cloud-300 bg-white p-3 shadow-card transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift"
                >
                  <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl">
                    <Image src={r.image} alt={r.title} fill sizes="100px" className="object-cover" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-[11.5px] font-bold text-brand-600">{r.category}</span>
                    <h3 className="mt-1 line-clamp-2 text-[13.5px] font-bold leading-6 text-navy-900 transition-colors group-hover:text-brand-600">
                      {r.title}
                    </h3>
                    <span className="mt-1 text-[12px] font-black text-navy-900">{formatPrice(r.price)} تومان</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <aside className="lg:col-span-4">
        <div className="sticky top-24 space-y-5">
          <div className="overflow-hidden rounded-[28px] border border-cloud-300 bg-white shadow-lift">
            <div className="relative aspect-[16/10]">
              <Image src={course.image} alt={course.title} fill sizes="(max-width: 1024px) 100vw, 400px" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/40 to-transparent" />
              {off && (
                <div className="absolute right-4 top-4">
                  <Badge tone="gold">{toFa(off)}٪ تخفیف</Badge>
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="flex items-end gap-3">
                <span className="text-3xl font-black text-navy-900">{formatPrice(course.price)}</span>
                <span className="pb-1 text-[13px] font-semibold text-ink-500">تومان</span>
                {course.originalPrice && (
                  <span className="pb-1 text-[13.5px] text-ink-400 line-through">{formatPrice(course.originalPrice)}</span>
                )}
              </div>

              <dl className="mt-5 space-y-3 border-y border-cloud-200 py-5 text-[13px]">
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-ink-500">
                    <GraduationCap className="h-4 w-4 text-brand-500" aria-hidden="true" /> مدرس
                  </dt>
                  <dd className="font-bold text-navy-900">{course.instructor}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-ink-500">
                    <Clock className="h-4 w-4 text-brand-500" aria-hidden="true" /> مدت دوره
                  </dt>
                  <dd className="font-bold text-navy-900">{course.duration}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-ink-500">
                    <BarChart3 className="h-4 w-4 text-brand-500" aria-hidden="true" /> سطح
                  </dt>
                  <dd className="font-bold text-navy-900">{course.level}</dd>
                </div>
              </dl>

              <Link
                href={`/courses/${course.slug}/checkout`}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-navy-900 py-4 text-[14px] font-bold text-white transition-colors hover:bg-brand-600"
              >
                <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                ثبت‌نام در دوره
              </Link>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-[11.5px] text-ink-400">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                این فرایند نمایشی است و پرداخت واقعی انجام نمی‌شود.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
