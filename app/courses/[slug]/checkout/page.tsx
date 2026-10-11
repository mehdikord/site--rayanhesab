import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Container, Section } from '@/app/components/ui/Section';
import { courses, getCourse } from '@/app/data/courses';
import CheckoutContent from './CheckoutContent';

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
  return {
    title: course ? `نهایی‌سازی خرید — ${course.title}` : 'نهایی‌سازی خرید',
    description: 'ثبت‌نام و خرید دوره آموزشی (نسخه نمایشی).',
    alternates: { canonical: `/courses/${slug}/checkout` },
    robots: { index: false, follow: false },
  };
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  return (
    <div className="flex min-h-screen flex-col bg-cloud-100">
      <div className="border-b border-cloud-300 bg-white pt-[68px]">
        <Container className="py-6">
          <nav aria-label="مسیر صفحه" className="flex flex-wrap items-center gap-2 text-[13px]">
            <Link href="/" className="text-ink-500 transition-colors hover:text-brand-600">خانه</Link>
            <ChevronLeft className="h-3.5 w-3.5 text-ink-300" aria-hidden="true" />
            <Link href="/courses" className="text-ink-500 transition-colors hover:text-brand-600">دوره‌ها</Link>
            <ChevronLeft className="h-3.5 w-3.5 text-ink-300" aria-hidden="true" />
            <Link href={`/courses/${course.slug}`} className="line-clamp-1 max-w-[220px] text-ink-500 transition-colors hover:text-brand-600">
              {course.title}
            </Link>
            <ChevronLeft className="h-3.5 w-3.5 text-ink-300" aria-hidden="true" />
            <span className="font-semibold text-navy-900">نهایی‌سازی خرید</span>
          </nav>
          <h1 className="mt-4 text-2xl font-black text-navy-900 sm:text-3xl">نهایی‌سازی خرید دوره</h1>
        </Container>
      </div>

      <main className="flex-1">
        <Section className="bg-cloud-100">
          <Container>
            <CheckoutContent course={course} />
          </Container>
        </Section>
      </main>
    </div>
  );
}
