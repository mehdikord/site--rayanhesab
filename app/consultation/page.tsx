import type { Metadata } from 'next';
import { Check, ShieldCheck, Clock, PhoneCall } from 'lucide-react';
import { Container, Eyebrow, Section, SectionHeading } from '@/app/components/ui/Section';
import { PageHero } from '@/app/components/ui/PageHero';
import { ConsultationForm } from '@/app/components/ui/ConsultationForm';

export const metadata: Metadata = {
  title: 'درخواست مشاوره رایگان',
  description:
    'برای بررسی شرایط کسب‌وکار و دریافت راهکار مالی مناسب، فرم درخواست مشاوره رایگان را تکمیل کنید تا کارشناسان رایان با شما تماس بگیرند.',
  alternates: { canonical: '/consultation' },
};

const steps = [
  { title: 'ثبت درخواست', desc: 'فرم را با اطلاعات تماس و نیاز خود تکمیل می‌کنید.' },
  { title: 'بررسی اولیه', desc: 'کارشناس رایان اطلاعات شما را بررسی می‌کند.' },
  { title: 'تماس و مشاوره', desc: 'برای بررسی شرایط و ارائه راهکار با شما تماس می‌گیریم.' },
];

const points = [
  { icon: PhoneCall, title: 'مشاوره تخصصی', desc: 'راهکار متناسب با نوع و اندازه کسب‌وکار شما.' },
  { icon: ShieldCheck, title: 'محرمانگی کامل', desc: 'اطلاعات شما محرمانه باقی می‌ماند.' },
  { icon: Clock, title: 'پاسخ سریع', desc: 'در سریع‌ترین زمان ممکن تماس می‌گیریم.' },
];

export default function ConsultationPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PageHero
        compact
        eyebrow="مشاوره رایگان"
        title="برای تصمیم‌های مالی مهم، تنها تصمیم نگیرید"
        description="نیاز کسب‌وکار خود را با ما مطرح کنید تا برای بررسی شرایط و ارائه راهکار مناسب با شما تماس بگیریم."
        breadcrumbs={[{ label: 'درخواست مشاوره' }]}
        image="/images/unsplash-1517048676732-d65bc937f952-1600.jpg"
      />

      <main className="flex-1">
        <Section className="bg-cloud-100">
          <Container>
            <div className="grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <Eyebrow>چرا رایان؟</Eyebrow>
                <SectionHeading title="مشاوره‌ای که به عمل می‌رسد" className="mt-4" />
                <ul className="mt-8 space-y-4">
                  {points.map((p) => (
                    <li key={p.title} className="flex items-start gap-4 rounded-[22px] border border-cloud-300 bg-white p-5 shadow-card">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                        <p.icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="text-[14px] font-bold text-navy-900">{p.title}</h3>
                        <p className="mt-1 text-[12.5px] leading-7 text-ink-500">{p.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 rounded-[24px] border border-cloud-300 bg-white p-6 shadow-card">
                  <h3 className="text-[14px] font-bold text-navy-900">فرایند مشاوره</h3>
                  <ol className="mt-5 space-y-5">
                    {steps.map((s, i) => (
                      <li key={s.title} className="flex items-start gap-4">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy-900 text-[12.5px] font-bold text-white">
                          {new Intl.NumberFormat('fa-IR').format(i + 1)}
                        </span>
                        <div>
                          <p className="text-[13.5px] font-bold text-navy-900">{s.title}</p>
                          <p className="mt-0.5 text-[12.5px] leading-6 text-ink-500">{s.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="lg:col-span-7">
                <ConsultationForm />
                <div className="mt-6 flex items-start gap-3 rounded-[22px] border border-cloud-300 bg-white p-5 text-[13px] leading-7 text-ink-500">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                  این فرم صرفاً یک نسخه نمایشی است؛ اطلاعات شما به سرور ارسال یا ذخیره نمی‌شود و هدف آن نمایش تجربه کاربری است.
                </div>
              </div>
            </div>
          </Container>
        </Section>
      </main>
    </div>
  );
}
