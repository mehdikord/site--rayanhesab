import type { Metadata } from 'next';
import { Check } from 'lucide-react';
import { Container, Eyebrow, Section, SectionHeading } from '@/app/components/ui/Section';
import { PageHero } from '@/app/components/ui/PageHero';
import { AccountantForm } from './AccountantForm';

export const metadata: Metadata = {
  title: 'ثبت درخواست همکاری حسابدار',
  description:
    'حسابداران متخصص می‌توانند با تکمیل فرم، پروفایل حرفه‌ای و رزومه خود را ثبت کنند تا در فرایند تطبیق و معرفی به کارفرمایان قرار بگیرند.',
  alternates: { canonical: '/recruitment/accountant' },
};

const benefits = [
  'دسترسی به فرصت‌های شغلی متناسب با تخصص شما',
  'قرار گرفتن در فرایند ارزیابی و تطبیق',
  'معرفی به کارفرمایان در صورت تطبیق',
  'هماهنگی مصاحبه و پیگیری مراحل',
];

export default function AccountantPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PageHero
        compact
        eyebrow="برای حسابداران"
        title="ثبت درخواست همکاری"
        description="پروفایل حرفه‌ای خود را ثبت کنید تا با فرصت‌های شغلی متناسب، تطبیق داده شوید."
        breadcrumbs={[{ label: 'جذب نیرو', href: '/recruitment' }, { label: 'ثبت درخواست همکاری' }]}
        image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1600&q=80"
      />

      <main className="flex-1">
        <Section className="bg-cloud-100">
          <Container>
            <div className="grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <Eyebrow>چرا از طریق رایان؟</Eyebrow>
                <SectionHeading title="مسیر شما تا فرصت شغلی مناسب" className="mt-4" />
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
                    رایان فرایند تطبیق و معرفی را تسهیل می‌کند؛ اما استخدام قطعی تضمین نمی‌شود و نتیجه به توافق میان شما و کارفرما بستگی دارد.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-8">
                <div className="rounded-[28px] border border-cloud-300 bg-white p-6 shadow-card sm:p-9">
                  <AccountantForm />
                </div>
              </div>
            </div>
          </Container>
        </Section>
      </main>
    </div>
  );
}
