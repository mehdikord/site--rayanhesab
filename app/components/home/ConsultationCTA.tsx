import { PhoneCall, ShieldCheck, Clock } from 'lucide-react';
import { Container, Eyebrow, Section } from '@/app/components/ui/Section';
import { ConsultationForm } from '@/app/components/ui/ConsultationForm';

const points = [
  { icon: Clock, title: 'پاسخ سریع', desc: 'در کمترین زمان ممکن با شما تماس می‌گیریم.' },
  { icon: ShieldCheck, title: 'محرمانه و مطمئن', desc: 'اطلاعات شما با رعایت کامل محرمانگی بررسی می‌شود.' },
  { icon: PhoneCall, title: 'مشاوره تخصصی', desc: 'راهکار متناسب با نیاز واقعی کسب‌وکار شما.' },
];

export function ConsultationCTA() {
  return (
    <Section className="relative overflow-hidden bg-white">
      <Container>
        <div className="grid items-stretch gap-8 rounded-[34px] border border-cloud-300 bg-cloud-100 p-6 sm:p-10 lg:grid-cols-2 lg:p-12">
          <div className="flex flex-col justify-center">
            <Eyebrow>مشاوره تخصصی</Eyebrow>
            <h2 className="mt-4 text-balance text-3xl font-black leading-[1.4] text-navy-900 sm:text-4xl">
              برای تصمیم‌های مالی مهم، تنها تصمیم نگیرید.
            </h2>
            <p className="mt-5 max-w-lg text-[15px] leading-9 text-ink-500">
              نیاز کسب‌وکار خود را با ما مطرح کنید تا برای بررسی شرایط و ارائه راهکار مناسب با شما تماس بگیریم.
            </p>

            <div className="mt-8 space-y-5">
              {points.map((p) => (
                <div key={p.title} className="flex items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-brand-600 shadow-card">
                    <p.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-[14.5px] font-bold text-navy-900">{p.title}</h3>
                    <p className="mt-1 text-[13px] text-ink-500">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-full">
              <ConsultationForm />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
