import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import { Container, Section } from '@/app/components/ui/Section';
import { PageHero } from '@/app/components/ui/PageHero';
import { Badge } from '@/app/components/ui/Badge';
import { courses, getCourse } from '@/app/data/courses';
import { CourseDetail } from './CourseDetail';
import { formatPrice, discountPercent, toFa } from '@/app/lib/utils';

export function generateStaticParams() {
  return courses.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) return { title: 'دوره یافت نشد' };
  return {
    title: course.title,
    description: course.excerpt,
    alternates: { canonical: `/courses/${course.slug}` },
  };
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  const related = course.related
    .map((s) => getCourse(s))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const off = discountPercent(course.price, course.originalPrice);

  return (
    <div className="flex min-h-screen flex-col bg-cloud-100">
      <PageHero
        eyebrow={course.category}
        title={course.title}
        description={course.excerpt}
        breadcrumbs={[{ label: 'دوره‌ها', href: '/courses' }, { label: course.title }]}
        image={course.image}
      >
        <div className="flex flex-wrap items-center gap-3">
          {course.tags.map((t) => (
            <Badge key={t} tone="brand" className="border-white/10 bg-white/10 text-white">
              {t}
            </Badge>
          ))}
          {off && (
            <span className="inline-flex items-center rounded-full bg-emerald-500 px-3 py-1 text-[12px] font-bold text-white">
              {toFa(off)}٪ تخفیف
            </span>
          )}
        </div>
      </PageHero>

      <main className="flex-1">
        <Section className="bg-cloud-100">
          <Container>
            <CourseDetail course={course} related={related} />
          </Container>
        </Section>
      </main>
    </div>
  );
}
