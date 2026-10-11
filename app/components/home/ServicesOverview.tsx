import { Badge } from '@/app/components/ui/Badge';
import { Container, Section, SectionHeading } from '@/app/components/ui/Section';
import { ServiceCard } from '@/app/components/ui/cards';
import { services } from '@/app/data/services';

export function ServicesOverview() {
  return (
    <Section id="services" className="bg-cloud-100">
      <Container>
        <SectionHeading
          eyebrow="خدمات ما"
          title="شش خدمه پایه برای رشد مالی شما"
          description="هر یک از خدمات ما برای حل چالش‌های خاص مالی و حسابداری طراحی شده‌اند."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <ServiceCard key={service.slug} service={service} index={index} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Badge className="border-0 bg-white/0 text-ink-500 hover:bg-cloud-200">
            تمام خدمات را مشاهده کنید
          </Badge>
        </div>
      </Container>
    </Section>
  );
}