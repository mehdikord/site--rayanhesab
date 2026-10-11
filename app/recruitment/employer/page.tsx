import type { Metadata } from 'next';
import { Check } from 'lucide-react';
import { Container, Eyebrow, Section, SectionHeading } from '@/app/components/ui/Section';
import { PageHero } from '@/app/components/ui/PageHero';
import { EmployerForm } from './EmployerForm';

export const metadata: Metadata = {
  title: 'درخواست جذب حسابدار',
  description:
    'کارفرمایان و کسب‌وکارها می‌توانند با تکمیل فرم، نیاز خود به نیروی حسابداری متخصص را ثبت کنند تا گزینه‌های ارزیابی‌شده معرفی شوند.',
  alternates: { canonical: '/recruitment/employer' },
};

const benefits = [
  'کاهش زمان و هزینه فرایند جذب',
  'دسترسی به متقاضیان ارزیابی‌شده',
  'تطبیق دقیق‌تر نیاز شما با مهارت متقاضی',
  'هماهنگی روان مصاحبه و انتخاب',
];

export default function EmployerPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PageHero
        compact
        eyebrow="برای کارفرمایان"
        title="درخواست جذب حسابدار"
        description="نیاز خود به نیروی حسابداری متخصص را ثبت کنید تا گزینه‌های متناسب با شرایط شما معرفی شوند."
        breadcrumbs={[{ label: 'جذب نیرو', href: '/recruitment' }, { label: 'درخواست جذب حسابدار' }]}
        image="/images/unsplash-1521737604893-d14cc237f11d-1600.jpg"
      />

      <main className="flex-1">
        <Section className="bg-cloud-100">
          <Container>
            <div className="grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <Eyebrow>جذب هوشمند</Eyebrow>
                <SectionHeading title="نیروی مالی مناسب، سریع‌تر و مطمئن‌تر" className="mt-4" />
                <ul className="mt-8 space-y-4">
                  {benefits.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-[14px] leading-8 text-ink-700">
                      <Check className="mt-1 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 rounded-[24px] border border-brand-100 bg-brand-50 p-6">
                  <p className="text-[13px] leading-8 text-brand-800">
                    رایان فرایند تطبیق و هماهنگی مصاحبه را انجام می‌دهد؛ اما استخدام قطعی تضمین نمی‌شود و انتخاب نهایی بر عهده شماست.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-8">
                <div className="rounded-[28px] border border-cloud-300 bg-white p-6 shadow-card sm:p-9">
                  <EmployerForm />
                </div>
              </div>
            </div>
          </Container>
        </Section>
      </main>
    </div>
  );
}
