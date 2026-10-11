import type { Metadata } from 'next';
import { GraduationCap, Sparkles, BadgeCheck, Users } from 'lucide-react';
import { Container, Section } from '@/app/components/ui/Section';
import { PageHero } from '@/app/components/ui/PageHero';
import { CourseCatalog } from './CourseCatalog';

export const metadata: Metadata = {
  title: 'دوره‌های آموزشی حسابداری و مالی',
  description:
    'مرور و جستجوی دوره‌های کاربردی حسابداری، مالیات، حسابرسی و حقوق و دستمزد؛ آموزش‌های پروژه‌محور و متناسب با بازار کار.',
  alternates: { canonical: '/courses' },
};

const highlights = [
  { icon: BadgeCheck, title: 'پروژه‌محور', desc: 'تمرین روی نمونه‌های واقعی' },
  { icon: Users, title: 'مدرسین حرفه‌ای', desc: 'متخصصان فعال بازار' },
  { icon: Sparkles, title: 'به‌روز و کاربردی', desc: 'متناسب با نیاز بازار کار' },
];

export default function CoursesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PageHero
        eyebrow="آموزش تخصصی"
        title="دوره‌هایی که مهارت واقعی می‌سازند"
        description="آموزش‌های کاربردی و پروژه‌محور برای ورود به بازار کار و رشد شغلی در حوزه حسابداری و مالی."
        breadcrumbs={[{ label: 'دوره‌ها' }]}
        image="/images/unsplash-1524178232363-1fb2b075b655-1600.jpg"
      >
        <div className="grid gap-5 sm:grid-cols-3">
          {highlights.map((h) => (
            <div key={h.title} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-brand-300">
                <h.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[13.5px] font-bold text-white">{h.title}</p>
                <p className="text-[11.5px] text-white/50">{h.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </PageHero>

      <main className="flex-1">
        <Section className="bg-cloud-100">
          <Container>
            <CourseCatalog />
          </Container>
        </Section>

        <Section className="bg-white">
          <Container>
            <div className="flex flex-col items-center justify-between gap-6 rounded-[30px] border border-cloud-300 bg-cloud-100 p-7 text-center sm:p-10 lg:flex-row lg:text-right">
              <div className="flex items-center gap-4">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-navy-900 text-white">
                  <GraduationCap className="h-7 w-7" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-[17px] font-extrabold text-navy-900">مطمئن نیستید کدام دوره مناسب شماست؟</h2>
                  <p className="mt-1 text-[13.5px] text-ink-500">مشاوره رایگان آموزشی دریافت کنید و مسیر درست را انتخاب کنید.</p>
                </div>
              </div>
              <a
                href="/consultation"
                className="shrink-0 rounded-full bg-navy-900 px-7 py-3.5 text-[13.5px] font-bold text-white transition-colors hover:bg-brand-600"
              >
                دریافت مشاوره آموزشی
              </a>
            </div>
          </Container>
        </Section>
      </main>
    </div>
  );
}
