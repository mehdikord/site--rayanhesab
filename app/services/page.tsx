import { Container, Eyebrow, Section, SectionHeading } from '@/app/components/ui/Section';
import { ServiceCard } from '@/app/components/ui/cards';
import { services } from '@/app/data/services';

export default function ServicesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <section className="relative overflow-hidden bg-navy-950 pt-[68px] text-white">
        <div className="pointer-events-none absolute inset-0 ledger-grid-light opacity-30" aria-hidden="true" />
        <Container className="relative py-16 sm:py-24">
          <Eyebrow onDark>خدمات ما</Eyebrow>
          <h1 className="mt-4 text-balance text-3xl font-black leading-[1.35] sm:text-4xl lg:text-[52px]">
            شش خدمه پایه برای رشد مالی شما
          </h1>
          <p className="mt-6 max-w-2xl text-[15px] leading-9 text-white/70">
            هر یک از خدمات ما برای حل چالش‌های خاص مالی و حسابداری طراحی شده‌اند. بر اساس نیاز خود یکی را انتخاب کنید.
          </p>
        </Container>
      </section>

      <main className="flex-1">
        <Section className="bg-cloud-100">
          <Container>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service, index) => (
                <ServiceCard key={service.slug} service={service} index={index} />
              ))}
            </div>
          </Container>
        </Section>
      </main>
    </div>
  );
}