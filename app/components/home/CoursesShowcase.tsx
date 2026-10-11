import Link from 'next/link';
import { ArrowUpLeft, Sparkles } from 'lucide-react';
import { Container, Eyebrow, Section, SectionHeading } from '@/app/components/ui/Section';
import { CourseCard, CourseCardWide } from '@/app/components/ui/cards';
import { ButtonLink } from '@/app/components/ui/Button';
import { courses } from '@/app/data/courses';

export function CoursesShowcase() {
  const featured = courses.find((c) => c.featured) ?? courses[0];
  const rest = courses.filter((c) => c.slug !== featured.slug).slice(0, 6);

  return (
    <Section className="relative overflow-hidden bg-navy-950">
      <div className="pointer-events-none absolute inset-0 ledger-grid-light opacity-30" aria-hidden="true" />
      <div className="pointer-events-none absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-brand-500/20 blur-[140px]" aria-hidden="true" />
      <Container className="relative">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading
            onDark
            eyebrow="آموزش تخصصی"
            title="دوره‌های کاربردی برای ورود و رشد در بازار کار"
            description="آموزش‌هایی پروژه‌محور که مهارت واقعی را جایگزین مفاهیم تئوری می‌کنند."
            className="lg:max-w-2xl"
          />
          <ButtonLink href="/courses" variant="on-dark" size="md" className="shrink-0">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            مشاهده همه دوره‌ها
          </ButtonLink>
        </div>

        <div className="mt-12">
          <CourseCardWide course={featured} />
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-[13.5px] font-bold text-white transition-colors hover:bg-white/10"
          >
            مشاهده همه دوره‌ها
            <ArrowUpLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </Section>
  );
}
