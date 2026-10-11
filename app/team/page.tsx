import type { Metadata } from 'next';
import { ArrowUpLeft } from 'lucide-react';
import { Container, Section, SectionHeading } from '@/app/components/ui/Section';
import { PageHero } from '@/app/components/ui/PageHero';
import { ButtonLink } from '@/app/components/ui/Button';
import { TeamCard } from '@/app/components/ui/cards';
import { team } from '@/app/data/team';

export const metadata: Metadata = {
  title: 'تیم رایان',
  description:
    'با متخصصان رایان حساب صبا در حوزه‌های حسابداری، مالیات، حسابرسی، آموزش و جذب نیرو آشنا شوید.',
  alternates: { canonical: '/team' },
};

export default function TeamPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PageHero
        eyebrow="تیم ما"
        title="متخصصانی که همراه شما هستند"
        description="تیمی متشکل از حسابداران، مشاوران مالیاتی، حسابرسان و متخصصان جذب نیرو که در کنار هم تصویری کامل از نیازهای مالی کسب‌وکار شما ارائه می‌دهند."
        breadcrumbs={[{ label: 'تیم ما' }]}
        image="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80"
      />

      <main className="flex-1">
        <Section className="bg-cloud-100">
          <Container>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((member) => (
                <TeamCard key={member.slug} member={member} />
              ))}
            </div>
          </Container>
        </Section>

        <Section className="bg-white">
          <Container>
            <div className="relative overflow-hidden rounded-[34px] bg-navy-900 px-7 py-12 text-center text-white sm:px-12 sm:py-16">
              <div className="pointer-events-none absolute inset-0 ledger-grid-light opacity-30" aria-hidden="true" />
              <h2 className="relative text-balance text-2xl font-black leading-[1.5] sm:text-3xl">
                می‌خواهید با تیم ما همکاری کنید؟
              </h2>
              <p className="relative mx-auto mt-4 max-w-xl text-[14.5px] leading-8 text-white/65">
                اگر حسابدار متخصص هستید یا به دنبال جذب نیروی مالی هستید، از صفحه جذب نیرو شروع کنید.
              </p>
              <div className="relative mt-8 flex flex-wrap justify-center gap-3">
                <ButtonLink href="/recruitment" variant="on-dark" size="lg">
                  صفحه جذب نیرو
                  <ArrowUpLeft className="h-4 w-4" aria-hidden="true" />
                </ButtonLink>
                <ButtonLink
                  href="/consultation"
                  variant="ghost"
                  size="lg"
                  className="border border-white/15 bg-white/5 text-white hover:bg-white/10"
                >
                  دریافت مشاوره
                </ButtonLink>
              </div>
            </div>
          </Container>
        </Section>
      </main>
    </div>
  );
}
