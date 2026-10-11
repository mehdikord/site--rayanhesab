import { Container, Section } from '@/app/components/ui/Section';
import { ShieldCheck, TrendingUp, Users, GraduationCap } from 'lucide-react';

const trustItems = [
  { icon: ShieldCheck, title: 'خدمات تخصصی مالی و مالیاتی', desc: 'از حسابداری تا دفاع مالیاتی، همه در یکجا' },
  { icon: GraduationCap, title: 'آموزش کاربردی برای بازار کار', desc: 'دوره‌های پروژه‌محور و مهارت‌محور' },
  { icon: Users, title: 'ارتباط میان حسابداران و کسب‌وکارها', desc: 'پلی برای جذب نیروی متخصص حسابداری' },
  { icon: TrendingUp, title: 'همراهی در تصمیم‌گیری‌های مالی', desc: 'مشاوره مبتنی بر داده برای رشد امنیت مالی' },
];

export function TrustStrip() {
  return (
    <Section className="border-y border-cloud-300 bg-white">
      <Container className="py-10 sm:py-12 lg:py-16">
        <dl className="grid gap-8 lg:grid-cols-4">
          {trustItems.map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center sm:items-start sm:text-right">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                <item.icon className="h-7 w-7" aria-hidden="true" />
              </div>
              <dt className="mt-5 text-[15.5px] font-bold text-navy-900 sm:text-[17px]">{item.title}</dt>
              <dd className="mt-2 text-[13.5px] text-ink-500">{item.desc}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </Section>
  );
}