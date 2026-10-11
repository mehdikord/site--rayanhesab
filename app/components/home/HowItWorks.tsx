import { Container, Eyebrow, Section, SectionHeading } from '@/app/components/ui/Section';

const steps = [
  { n: '۰۱', title: 'گفت‌وگو و شناخت', desc: 'اهداف، چالش‌ها و وضعیت فعلی شما را با دقت گوش می‌دهیم تا تصویر روشنی بسازیم.' },
  { n: '۰۲', title: 'تحلیل و برنامه‌ریزی', desc: 'داده‌ها، اسناد و شاخص‌های کلیدی را بررسی و یک برنامه عملیاتی روشن تدوین می‌کنیم.' },
  { n: '۰۳', title: 'اجرا و همراهی', desc: 'برنامه را با تیم متخصص اجرا می‌کنیم و در تمام مسیر همراه شما هستیم.' },
  { n: '۰۴', title: 'پایش و بهینه‌سازی', desc: 'نتایج را اندازه می‌گیریم و با بازخورد مستمر، کیفیت را بالا نگاه می‌داریم.' },
];

export function HowItWorks() {
  return (
    <Section className="overflow-hidden bg-cloud-100">
      <Container className="relative">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="نحوه همکاری"
              title="چهار گام تا یک تجربه مالی روان"
              description="هر خدمت رایان از شناخت دقیق شروع می‌شود، با اجرای دقیق پیش می‌رود و با پایش مستمر ماندگار می‌ماند."
            />
          </div>
          <div className="relative">
            <div
              className="pointer-events-none absolute inset-0 hidden rounded-[30px] bg-white lg:block"
              aria-hidden="true"
            />
            <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-1 lg:p-8">
              {steps.map((s) => (
                <div
                  key={s.n}
                  className="rounded-[22px] border border-cloud-300 bg-white p-6 shadow-card lg:border-0 lg:bg-cloud-100 lg:shadow-none lg:p-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy-900 text-[13px] font-black text-white" dir="ltr">
                      {s.n}
                    </span>
                    <h3 className="text-[15px] font-extrabold text-navy-900">{s.title}</h3>
                  </div>
                  <p className="mt-3 text-[13.5px] leading-7 text-ink-500">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}