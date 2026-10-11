import type { Metadata } from 'next';
import { Briefcase, UserRound, ArrowUpLeft, Check, ShieldCheck, Users, Search, Handshake, CalendarCheck } from 'lucide-react';
import { Container, Eyebrow, Section, SectionHeading } from '@/app/components/ui/Section';
import { PageHero } from '@/app/components/ui/PageHero';
import { ButtonLink } from '@/app/components/ui/Button';

export const metadata: Metadata = {
  title: 'جذب و معرفی حسابدار متخصص',
  description:
    'رایان فرایند تطبیق، معرفی و هماهنگی مصاحبه میان حسابداران متخصص و کسب‌وکارها را تسهیل می‌کند. ثبت درخواست همکاری و درخواست جذب حسابدار.',
  alternates: { canonical: '/recruitment' },
};

const processSteps = [
  { icon: Check, title: 'ثبت درخواست', desc: 'کارفرما نیاز خود و متقاضی پروفایل حرفه‌ای خود را ثبت می‌کند.' },
  { icon: Search, title: 'بررسی اطلاعات و نیازمندی‌ها', desc: 'نیاز کارفرما و اطلاعات متقاضیان دقیق بررسی می‌شود.' },
  { icon: Users, title: 'ارزیابی و تطبیق اولیه', desc: 'گزینه‌های متناسب با نیاز کارفرما انتخاب و غربال می‌شوند.' },
  { icon: Handshake, title: 'معرفی گزینه‌های مناسب', desc: 'متقاضیان متناسب به کارفرما معرفی می‌شوند.' },
  { icon: CalendarCheck, title: 'هماهنگی مصاحبه حضوری', desc: 'مراحل مصاحبه و انتخاب نهایی هماهنگ می‌شود.' },
];

export default function RecruitmentPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PageHero
        eyebrow="جذب و استعدادها"
        title="جذب و معرفی حسابدار متخصص"
        description="پلی میان حسابداران متخصص و کسب‌وکارهایی که به نیروی مالی قابل اعتماد نیاز دارند؛ از ارزیابی تا هماهنگی مصاحبه."
        breadcrumbs={[{ label: 'جذب نیرو' }]}
        image="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1600&q=80"
      >
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/recruitment/accountant" variant="on-dark" size="md">
            ثبت درخواست همکاری
            <ArrowUpLeft className="h-4 w-4" aria-hidden="true" />
          </ButtonLink>
          <ButtonLink
            href="/recruitment/employer"
            variant="ghost"
            size="md"
            className="border border-white/15 bg-white/5 text-white hover:bg-white/10"
          >
            درخواست جذب حسابدار
          </ButtonLink>
        </div>
      </PageHero>

      <main className="flex-1">
        <Section className="bg-cloud-100">
          <Container>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="flex flex-col rounded-[30px] border border-cloud-300 bg-white p-7 shadow-card sm:p-9">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-white">
                  <UserRound className="h-7 w-7" aria-hidden="true" />
                </span>
                <h2 className="mt-5 text-xl font-black text-navy-900">حسابداران حرفه‌ای</h2>
                <p className="mt-3 flex-1 text-[14px] leading-8 text-ink-500">
                  اگر به دنبال فرصت شغلی متناسب با تخصص، تجربه و نوع همکاری مورد نظر خود هستید، پروفایل حرفه‌ای خود را ثبت کنید تا در فرایند تطبیق قرار بگیرید.
                </p>
                <ButtonLink href="/recruitment/accountant" variant="primary" size="md" className="mt-7 self-start">
                  ثبت درخواست همکاری
                  <ArrowUpLeft className="h-4 w-4" aria-hidden="true" />
                </ButtonLink>
              </div>

              <div className="flex flex-col rounded-[30px] border border-navy-800 bg-navy-900 p-7 text-white sm:p-9">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-navy-900">
                  <Briefcase className="h-7 w-7" aria-hidden="true" />
                </span>
                <h2 className="mt-5 text-xl font-black">کارفرمایان و کسب‌وکارها</h2>
                <p className="mt-3 flex-1 text-[14px] leading-8 text-white/65">
                  اگر به دنبال حسابدار متخصص و قابل اعتماد هستید، نیاز خود را ثبت کنید تا گزینه‌های ارزیابی‌شده و متناسب با شرایط شما معرفی شوند.
                </p>
                <ButtonLink href="/recruitment/employer" variant="on-dark" size="md" className="mt-7 self-start">
                  درخواست جذب حسابدار
                  <ArrowUpLeft className="h-4 w-4" aria-hidden="true" />
                </ButtonLink>
              </div>
            </div>
          </Container>
        </Section>

        <Section className="bg-white">
          <Container>
            <SectionHeading
              align="center"
              eyebrow="فرایند تطبیق"
              title="چگونه تطبیق و معرفی انجام می‌شود؟"
              description="رایان فرایند تطبیق، معرفی و هماهنگی مصاحبه را تسهیل می‌کند. نتیجه نهایی استخدام به توافق دو طرف بستگی دارد و تضمین نمی‌شود."
            />
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {processSteps.map((s, i) => (
                <div key={s.title} className="relative rounded-[24px] border border-cloud-300 bg-cloud-100 p-6">
                  <div className="flex items-center justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-brand-600 shadow-card">
                      <s.icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <span className="text-2xl font-black text-cloud-400" dir="ltr">
                      {new Intl.NumberFormat('fa-IR', { minimumIntegerDigits: 2 }).format(i + 1)}
                    </span>
                  </div>
                  <h3 className="mt-4 text-[14.5px] font-extrabold leading-7 text-navy-900">{s.title}</h3>
                  <p className="mt-2 text-[12.5px] leading-7 text-ink-500">{s.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex items-start gap-4 rounded-[24px] border border-brand-100 bg-brand-50 p-6">
              <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-brand-600" aria-hidden="true" />
              <p className="text-[13.5px] leading-8 text-brand-800">
                رایان نقش تسهیل‌گر دارد و فرایند ارزیابی، تطبیق و هماهنگی مصاحبه را انجام می‌دهد. ما استخدام یا جذب قطعی را تضمین نمی‌کنیم و نتیجه نهایی به توافق میان کارفرما و متقاضی بستگی دارد.
              </p>
            </div>
          </Container>
        </Section>

        <Section className="bg-cloud-100">
          <Container>
            <div className="relative overflow-hidden rounded-[34px] bg-navy-900 px-7 py-12 text-center text-white sm:px-12 sm:py-16">
              <div className="pointer-events-none absolute inset-0 ledger-grid-light opacity-30" aria-hidden="true" />
              <Eyebrow onDark className="justify-center">شروع کنید</Eyebrow>
              <h2 className="relative mt-4 text-balance text-2xl font-black leading-[1.5] sm:text-3xl">
                آماده‌اید مسیر جذب یا استخدام را شروع کنید؟
              </h2>
              <p className="relative mx-auto mt-4 max-w-xl text-[14.5px] leading-8 text-white/65">
                درخواست خود را ثبت کنید؛ تیم ما فرایند بررسی و تطبیق را آغاز می‌کند.
              </p>
              <div className="relative mt-8 flex flex-wrap justify-center gap-3">
                <ButtonLink href="/recruitment/accountant" variant="on-dark" size="lg">
                  ثبت درخواست همکاری
                </ButtonLink>
                <ButtonLink
                  href="/recruitment/employer"
                  variant="ghost"
                  size="lg"
                  className="border border-white/15 bg-white/5 text-white hover:bg-white/10"
                >
                  درخواست جذب حسابدار
                </ButtonLink>
              </div>
            </div>
          </Container>
        </Section>
      </main>
    </div>
  );
}
