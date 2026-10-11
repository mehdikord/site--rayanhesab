import Image from 'next/image';
import { Briefcase, UserRound, ArrowUpLeft, Check } from 'lucide-react';
import { Container, Eyebrow, Section, SectionHeading } from '@/app/components/ui/Section';
import { ButtonLink } from '@/app/components/ui/Button';

const forTalent = [
  'ثبت درخواست همکاری و ارسال رزومه',
  'ثبت مهارت‌ها، سوابق و تجربه کاری',
  'انتخاب موقعیت شغلی و نوع همکاری مورد نظر',
  'معرفی به کارفرمایان متناسب با پروفایل شما',
];

const forEmployers = [
  'ثبت شرح شغل و مهارت‌های مورد نیاز',
  'تعیین سطح تجربه و نوع استخدام',
  'دریافت گزینه‌های ارزیابی‌شده و متناسب',
  'هماهنگی مصاحبه و مراحل انتخاب',
];

const steps = ['ثبت درخواست', 'بررسی اطلاعات و نیازمندی‌ها', 'ارزیابی و تطبیق اولیه', 'معرفی گزینه‌های مناسب', 'هماهنگی مصاحبه حضوری'];

export function RecruitmentSection() {
  return (
    <Section className="bg-white">
      <Container>
        <SectionHeading
          align="center"
          eyebrow="جذب و استعدادها"
          title="پلی میان حسابداران متخصص و کسب‌وکارها"
          description="رایان فرایند تطبیق، معرفی و هماهنگی مصاحبه را تسهیل می‌کند؛ بدون وعده استخدام تضمینی."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-[30px] border border-cloud-300 bg-cloud-100 p-7 sm:p-9">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-white">
                <UserRound className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="text-[19px] font-extrabold text-navy-900">برای حسابداران</h3>
            </div>
            <p className="mt-4 text-[14px] leading-8 text-ink-500">
              اگر به دنبال فرصت شغلی متناسب با تخصص و تجربه خود هستید، پروفایل حرفه‌ای خود را ثبت کنید.
            </p>
            <ul className="mt-6 space-y-3">
              {forTalent.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[13.5px] text-ink-700">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <ButtonLink href="/recruitment/accountant" variant="primary" size="md" className="mt-8">
              ثبت درخواست همکاری
              <ArrowUpLeft className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
          </div>

          <div className="relative overflow-hidden rounded-[30px] border border-navy-800 bg-navy-900 p-7 text-white sm:p-9">
            <div className="pointer-events-none absolute inset-0 ledger-grid-light opacity-30" aria-hidden="true" />
            <div className="relative flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-navy-900">
                <Briefcase className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="text-[19px] font-extrabold">برای کارفرمایان</h3>
            </div>
            <p className="relative mt-4 text-[14px] leading-8 text-white/65">
              به دنبال حسابدار متخصص و قابل اعتماد هستید؟ نیاز خود را ثبت کنید تا گزینه‌های مناسب معرفی شوند.
            </p>
            <ul className="relative mt-6 space-y-3">
              {forEmployers.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[13.5px] text-white/80">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <ButtonLink href="/recruitment/employer" variant="on-dark" size="md" className="relative mt-8">
              درخواست جذب حسابدار
              <ArrowUpLeft className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
          </div>
        </div>

        <div className="mt-14 rounded-[30px] border border-cloud-300 bg-cloud-100 p-7 sm:p-10">
          <Eyebrow>فرایند تطبیق</Eyebrow>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((step, i) => (
              <div key={step} className="relative">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy-900 text-[13px] font-bold text-white">
                    {new Intl.NumberFormat('fa-IR').format(i + 1)}
                  </span>
                  {i < steps.length - 1 && <span className="hidden h-px flex-1 bg-cloud-400 lg:block" />}
                </div>
                <p className="mt-4 text-[14px] font-bold leading-7 text-navy-900">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
