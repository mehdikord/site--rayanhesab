import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Check,
  ArrowUpLeft,
  Quote,
  Target,
  Users,
  ChevronLeft,
} from 'lucide-react';
import { Container, Eyebrow, Section, SectionHeading } from '@/app/components/ui/Section';
import { Accordion } from '@/app/components/ui/Accordion';
import { ButtonLink } from '@/app/components/ui/Button';
import { PageHero } from '@/app/components/ui/PageHero';
import { Icon } from '@/app/components/ui/Icon';
import { services, getService } from '@/app/data/services';

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return { title: 'خدمت یافت نشد' };
  return {
    title: service.title,
    description: service.excerpt,
    alternates: { canonical: `/services/${service.slug}` },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const related = service.related
    .map((s) => getService(s))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PageHero
        eyebrow={`خدمت / ${service.short}`}
        title={service.title}
        description={service.excerpt}
        image={service.image}
        breadcrumbs={[{ label: 'خدمات', href: '/services' }, { label: service.title }]}
      >
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/consultation" variant="on-dark" size="md">
            درخواست مشاوره
            <ArrowUpLeft className="h-4 w-4" aria-hidden="true" />
          </ButtonLink>
          <ButtonLink
            href="/contact"
            variant="ghost"
            size="md"
            className="border border-white/15 bg-white/5 text-white hover:bg-white/10"
          >
            تماس با ما
          </ButtonLink>
        </div>
      </PageHero>

      <main className="flex-1">
        <Section className="bg-white">
          <Container>
            <div className="grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <Eyebrow>نگاه کلی</Eyebrow>
                <h2 className="mt-4 text-2xl font-black leading-[1.5] text-navy-900 sm:text-3xl">
                  چه مسئله‌ای را برای شما حل می‌کنیم؟
                </h2>
                <p className="mt-5 text-[15px] leading-9 text-ink-500">{service.excerpt}</p>

                <ul className="mt-8 space-y-4">
                  {service.problems.map((p) => (
                    <li key={p} className="flex items-start gap-3 rounded-2xl border border-cloud-300 bg-cloud-100 p-5">
                      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-navy-900 text-white">
                        <Check className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="text-[14px] leading-8 text-ink-700">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <aside className="lg:col-span-5">
                <div className="sticky top-24 space-y-6">
                  <div className="overflow-hidden rounded-[28px] border border-cloud-300 shadow-card">
                    <div className="relative aspect-[4/3]">
                      <Image src={service.image} alt={service.title} fill sizes="(max-width: 1024px) 100vw, 480px" className="object-cover" />
                    </div>
                    <div className="bg-navy-900 p-6 text-white">
                      <Icon name={service.icon} className="h-8 w-8 text-brand-300" aria-hidden="true" />
                      <p className="mt-4 text-[15px] font-bold">{service.short}</p>
                      <p className="mt-2 text-[13px] leading-7 text-white/60">برای بررسی شرایط و دریافت راهکار مناسب، درخواست مشاوره ثبت کنید.</p>
                      <ButtonLink href="/consultation" variant="on-dark" size="md" className="mt-5">
                        شروع مشاوره رایگان
                      </ButtonLink>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </Container>
        </Section>

        <Section className="bg-cloud-100">
          <Container>
            <SectionHeading eyebrow="دامنه خدمات" title="این خدمت شامل چه مواردی است؟" />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {service.scope.map((item, i) => (
                <div key={item.title} className="rounded-[24px] border border-cloud-300 bg-white p-6 shadow-card">
                  <span className="text-[12px] font-black text-brand-500" dir="ltr">
                    {new Intl.NumberFormat('fa-IR', { minimumIntegerDigits: 2 }).format(i + 1)}
                  </span>
                  <h3 className="mt-3 text-[16px] font-extrabold text-navy-900">{item.title}</h3>
                  <p className="mt-2 text-[13.5px] leading-7 text-ink-500">{item.description}</p>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        <Section className="bg-white">
          <Container>
            <div className="grid gap-12 lg:grid-cols-2">
              <div>
                <SectionHeading eyebrow="مزایا" title="چه دستاوردی برای شما دارد؟" />
                <ul className="mt-8 space-y-4">
                  {service.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-[14.5px] leading-8 text-ink-700">
                      <Check className="mt-1 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[30px] border border-cloud-300 bg-cloud-100 p-7 sm:p-9">
                <Eyebrow>مخاطبان</Eyebrow>
                <h3 className="mt-4 text-xl font-extrabold text-navy-900">این خدمت برای چه کسانی مناسب است؟</h3>
                <div className="mt-6 flex flex-wrap gap-3">
                  {service.audience.map((a) => (
                    <span key={a} className="inline-flex items-center gap-2 rounded-full border border-cloud-300 bg-white px-4 py-2.5 text-[13px] font-semibold text-ink-700">
                      <Users className="h-4 w-4 text-brand-500" aria-hidden="true" />
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </Section>

        <Section className="relative overflow-hidden bg-navy-950 text-white">
          <div className="pointer-events-none absolute inset-0 ledger-grid-light opacity-30" aria-hidden="true" />
          <Container className="relative">
            <SectionHeading onDark eyebrow="فرایند اجرا" title="مسیر همکاری از ابتدا تا نتیجه" />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {service.process.map((p) => (
                <div key={p.step} className="relative rounded-[24px] border border-white/10 bg-white/5 p-6 backdrop-blur">
                  <span className="text-[26px] font-black text-brand-400" dir="ltr">{p.step}</span>
                  <h3 className="mt-3 text-[16px] font-extrabold">{p.title}</h3>
                  <p className="mt-2 text-[13px] leading-7 text-white/60">{p.description}</p>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        <Section className="bg-white">
          <Container className="max-w-3xl">
            <SectionHeading align="center" eyebrow="سوالات متداول" title="پرسش‌هایی که ممکن است داشته باشید" />
            <div className="mt-10">
              <Accordion items={service.faqs} />
            </div>
          </Container>
        </Section>

        <Section className="bg-cloud-100">
          <Container>
            <SectionHeading eyebrow="خدمات مرتبط" title="ممکن است این‌ها هم مفید باشند" />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/services/${r.slug}`}
                  className="group rounded-[24px] border border-cloud-300 bg-white p-6 shadow-card transition-all duration-400 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                    <Icon name={r.icon} className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-[16px] font-extrabold text-navy-900 transition-colors group-hover:text-brand-600">{r.title}</h3>
                  <p className="mt-2 text-[13px] leading-7 text-ink-500">{r.short}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-brand-600">
                    اطلاعات بیشتر
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          </Container>
        </Section>

        <Section className="bg-white">
          <Container>
            <div className="relative overflow-hidden rounded-[34px] bg-navy-900 px-7 py-12 text-center text-white sm:px-12 sm:py-16">
              <div className="pointer-events-none absolute inset-0 ledger-grid-light opacity-30" aria-hidden="true" />
              <Quote className="relative mx-auto h-10 w-10 text-brand-400" aria-hidden="true" />
              <h2 className="relative mt-5 text-balance text-2xl font-black leading-[1.5] sm:text-3xl">
                آماده‌اید این خدمت را شروع کنید؟
              </h2>
              <p className="relative mx-auto mt-4 max-w-xl text-[14.5px] leading-8 text-white/65">
                نیاز خود را ثبت کنید تا برای بررسی شرایط و ارائه راهکار مناسب با شما تماس بگیریم.
              </p>
              <div className="relative mt-8 flex justify-center">
                <ButtonLink href="/consultation" variant="on-dark" size="lg">
                  <Target className="h-5 w-5" aria-hidden="true" />
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
