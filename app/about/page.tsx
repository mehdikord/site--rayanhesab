import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Target, Compass, HeartHandshake, ArrowUpLeft, Check } from 'lucide-react';
import { Container, Eyebrow, Section, SectionHeading } from '@/app/components/ui/Section';
import { PageHero } from '@/app/components/ui/PageHero';
import { ButtonLink } from '@/app/components/ui/Button';
import { TeamCard } from '@/app/components/ui/cards';
import { services } from '@/app/data/services';
import { team } from '@/app/data/team';

export const metadata: Metadata = {
  title: 'درباره رایان حساب صبا',
  description:
    'رایان حساب صبا با هدف ارائه خدمات تخصصی حسابداری، مالیاتی، آموزشی و جذب نیروی متخصص، همراه کسب‌وکارها در مسیر رشد مالی است.',
  alternates: { canonical: '/about' },
};

const values = [
  { icon: Target, title: 'دقت و صحت', desc: 'گزارش‌های مالی دقیق و قابل اتکا، پایه اعتماد ما است.' },
  { icon: Compass, title: 'شفافیت', desc: 'ارتباط روشن و بی‌ابهام در تمام مراحل همکاری.' },
  { icon: HeartHandshake, title: 'همراهی', desc: 'در تصمیم‌های مالی مهم، تنها نمی‌مانید.' },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PageHero
        eyebrow="درباره ما"
        title="همراه مطمئن کسب‌وکار شما در مسیر رشد مالی"
        description="رایان حساب صبا با هدف ارائه خدمات تخصصی حسابداری، مالیاتی، آموزشی و جذب نیروی متخصص شکل گرفته است؛ با تمرکز بر دقت، شفافیت و همراهی واقعی."
        breadcrumbs={[{ label: 'درباره ما' }]}
      />

      <main className="flex-1">
        <Section className="bg-white">
          <Container>
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="relative">
                <div className="img-frame relative aspect-[4/3] overflow-hidden rounded-[30px] shadow-card">
                  <Image
                    src="/images/unsplash-1556761175-5973dc0f32e7-1400.jpg"
                    alt="تیم رایان حساب صبا در جلسه کاری"
                    fill
                    sizes="(max-width: 1024px) 100vw, 560px"
                    className="object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-4 hidden w-52 rounded-[22px] border border-cloud-300 bg-white p-5 shadow-lift sm:block">
                  <p className="text-[12.5px] font-bold text-navy-900">رویکرد ما</p>
                  <p className="mt-2 text-[12px] leading-6 text-ink-500">
                    راهکار متناسب با هر کسب‌وکار، به‌جای نسخه‌های یکسان.
                  </p>
                </div>
              </div>
              <div>
                <Eyebrow>داستان ما</Eyebrow>
                <h2 className="mt-4 text-2xl font-black leading-[1.5] text-navy-900 sm:text-3xl">
                  مالی را از یک هزینه، به یک فرصت تبدیل می‌کنیم
                </h2>
                <p className="mt-5 text-[15px] leading-9 text-ink-500">
                  ما باور داریم دانش مالی درست، می‌تواند مسیر رشد یک کسب‌وکار را تغییر دهد. به همین دلیل در رایان، خدمات حسابداری و مالیاتی را با مشاوره کاربردی و آموزش تخصصی ترکیب کرده‌ایم.
                </p>
                <p className="mt-4 text-[15px] leading-9 text-ink-500">
                  تیم ما از متخصصان حسابداری، مالیات، حسابرسی و جذب نیرو تشکیل شده است که در کنار هم، تصویری کامل از نیازهای مالی کسب‌وکار شما ارائه می‌دهند.
                </p>
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {values.map((v) => (
                    <div key={v.title} className="rounded-[22px] border border-cloud-300 bg-cloud-100 p-5">
                      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-brand-600 shadow-card">
                        <v.icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <h3 className="mt-4 text-[14px] font-bold text-navy-900">{v.title}</h3>
                      <p className="mt-1.5 text-[12px] leading-6 text-ink-500">{v.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </Section>

        <Section className="bg-cloud-100">
          <Container>
            <SectionHeading
              align="center"
              eyebrow="خدمات ما"
              title="چه کاری برای شما انجام می‌دهیم؟"
              description="مجموعه‌ای از خدمات مالی، مالیاتی، آموزشی و جذب نیرو در یک مجموعه یکپارچه."
            />
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => (
                <Link
                  key={s.slug}
                  href={`/services/${s.slug}`}
                  className="group flex items-center gap-4 rounded-[22px] border border-cloud-300 bg-white p-5 shadow-card transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                    <Check className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="flex-1 text-[14px] font-bold text-navy-900 transition-colors group-hover:text-brand-600">
                    {s.title}
                  </span>
                  <ArrowUpLeft className="h-4 w-4 text-ink-400" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </Container>
        </Section>

        <Section className="bg-white">
          <Container>
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
              <SectionHeading eyebrow="تیم ما" title="متخصصانی که همراه شما هستند" />
              <ButtonLink href="/team" variant="secondary" size="md" className="shrink-0">
                مشاهده تیم کامل
                <ArrowUpLeft className="h-4 w-4" aria-hidden="true" />
              </ButtonLink>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {team.slice(0, 3).map((m) => (
                <TeamCard key={m.slug} member={m} />
              ))}
            </div>
          </Container>
        </Section>

        <Section className="bg-cloud-100">
          <Container>
            <div className="relative overflow-hidden rounded-[34px] bg-navy-900 px-7 py-12 text-center text-white sm:px-12 sm:py-16">
              <div className="pointer-events-none absolute inset-0 ledger-grid-light opacity-30" aria-hidden="true" />
              <h2 className="relative text-balance text-2xl font-black leading-[1.5] sm:text-3xl">
                بیایید درباره رشد مالی کسب‌وکارتان صحبت کنیم
              </h2>
              <p className="relative mx-auto mt-4 max-w-xl text-[14.5px] leading-8 text-white/65">
                در یک جلسه مشاوره رایگان، نیازها و فرصت‌های مالی شما را بررسی می‌کنیم.
              </p>
              <div className="relative mt-8 flex justify-center">
                <ButtonLink href="/consultation" variant="on-dark" size="lg">
                  درخواست مشاوره رایگان
                </ButtonLink>
              </div>
            </div>
          </Container>
        </Section>
      </main>
    </div>
  );
}
