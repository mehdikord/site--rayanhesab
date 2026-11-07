import type { Metadata } from 'next';
import { Mail, Phone, MapPin, Clock, MessageCircle, ArrowUpLeft } from 'lucide-react';
import { Container, Eyebrow, Section, SectionHeading } from '@/app/components/ui/Section';
import { PageHero } from '@/app/components/ui/PageHero';
import { ButtonLink } from '@/app/components/ui/Button';
import { ContactForm } from './ContactForm';
import { getSiteSettings } from '@/app/lib/site-data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'تماس با ما',
  description:
    'برای پرسش درباره خدمات حسابداری، مالیاتی، آموزشی و جذب نیرو با رایان حساب صبا در تماس باشید یا فرم ارتباط را تکمیل کنید.',
  alternates: { canonical: '/contact' },
};

export default async function ContactPage() {
  const s = await getSiteSettings();

  const contactItems = [
    { icon: Phone, label: 'تلفن', value: s.phone, dir: 'ltr' as const, href: s.phoneLink },
    { icon: Mail, label: 'ایمیل', value: s.email, dir: 'ltr' as const, href: `mailto:${s.email}` },
    { icon: MapPin, label: 'آدرس', value: s.address, dir: 'rtl' as const },
    { icon: Clock, label: 'ساعات کاری', value: s.workingHours, dir: 'rtl' as const },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PageHero
        compact
        eyebrow="تماس با ما"
        title="بیایید صحبت کنیم"
        description="برای پرسش درباره خدمات، دوره‌ها یا جذب نیرو، از راه‌های زیر با ما در ارتباط باشید."
        breadcrumbs={[{ label: 'تماس با ما' }]}
      />

      <div className="flex-1">
        <Section className="bg-cloud-100">
          <Container>
            <div className="grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <Eyebrow>راه‌های ارتباطی</Eyebrow>
                <SectionHeading title="در دسترس شما هستیم" className="mt-4" />
                <dl className="mt-8 space-y-4">
                  {contactItems.map((c) => (
                    <div key={c.label} className="flex items-start gap-4 rounded-[22px] border border-cloud-300 bg-white p-5 shadow-card">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                        <c.icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div>
                        <dt className="text-[12.5px] font-semibold text-ink-500">{c.label}</dt>
                        <dd className="mt-1 text-[14.5px] font-bold text-navy-900" dir={c.dir}>
                          {c.href ? (
                            <a href={c.href} className="transition-colors hover:text-brand-600">
                              {c.value}
                            </a>
                          ) : (
                            c.value
                          )}
                        </dd>
                      </div>
                    </div>
                  ))}
                </dl>

                <div className="mt-6 flex items-start gap-4 rounded-[22px] border border-brand-100 bg-brand-50 p-6">
                  <MessageCircle className="mt-0.5 h-6 w-6 shrink-0 text-brand-600" aria-hidden="true" />
                  <div>
                    <p className="text-[14px] font-bold text-brand-900">نیاز به مشاوره تخصصی دارید؟</p>
                    <p className="mt-1 text-[13px] leading-7 text-brand-800">
                      فرم مشاوره را تکمیل کنید تا کارشناسان ما با شما تماس بگیرند.
                    </p>
                    <ButtonLink href="/consultation" variant="primary" size="sm" className="mt-4">
                      درخواست مشاوره
                      <ArrowUpLeft className="h-4 w-4" aria-hidden="true" />
                    </ButtonLink>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="rounded-[28px] border border-cloud-300 bg-white p-6 shadow-card sm:p-9">
                  <h2 className="text-xl font-black text-navy-900">ارسال پیام</h2>
                  <p className="mt-2 text-[13.5px] text-ink-500">
                    فرم زیر را تکمیل کنید تا تیم رایان با شما در ارتباط باشد.
                  </p>
                  <div className="mt-6">
                    <ContactForm />
                  </div>
                </div>

                <div className="mt-6 overflow-hidden rounded-[28px] border border-cloud-300 bg-cloud-100 shadow-card">
                  <div className="relative flex h-64 items-center justify-center ledger-grid-light">
                    <div className="text-center">
                      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-brand-600 shadow-card">
                        <MapPin className="h-7 w-7" aria-hidden="true" />
                      </span>
                      <p className="mt-4 text-[14px] font-bold text-navy-900">نقشه دفتر مرکزی</p>
                      <p className="mt-1 text-[12.5px] text-ink-500">محل دقیق دفتر مرکزی به‌زودی اینجا نمایش داده می‌شود.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </Section>
      </div>
    </div>
  );
}
