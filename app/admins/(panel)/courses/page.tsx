import { prisma } from '@/app/lib/prisma';
import { PageTitle, Card, CardHeader, AButton } from '@/app/admins/_components/kit';
import { CoursesManager, type CourseRow } from './_CoursesManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'دوره‌ها' };

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? '').trim();
  const status = params.status as 'all' | 'draft' | 'published' | 'archived' | undefined;

  const courses = await prisma.course.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { title: { contains: q } },
                { slug: { contains: q } },
              ],
            }
          : undefined,
        status && status !== 'all' ? { status: status as 'draft' | 'published' | 'archived' } : undefined,
      ].filter(Boolean) as never,
    },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    include: {
      category: { select: { name: true } },
      instructor: { select: { name: true } },
      chapters: {
        orderBy: { sortOrder: 'asc' },
        include: { lessons: { orderBy: { sortOrder: 'asc' } } },
      },
      faqs: { orderBy: { sortOrder: 'asc' } },
      features: { orderBy: { sortOrder: 'asc' } },
      relatedAsSource: { select: { relatedCourseId: true } },
      tags: { select: { tag: { select: { id: true, name: true } } } },
      _count: { select: { enrollments: true } },
    },
  });

  const [courseCategories, instructors, tags, allCourses] = await Promise.all([
    prisma.courseCategory.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.instructor.findMany({ orderBy: { name: 'asc' } }),
    prisma.tag.findMany({ orderBy: { name: 'asc' } }),
    prisma.course.findMany({ orderBy: { title: 'asc' }, select: { id: true, title: true } }),
  ]);

  const rows: CourseRow[] = courses.map((c) => ({
    id: String(c.id),
    slug: c.slug,
    title: c.title,
    excerpt: c.excerpt,
    description: c.description,
    image: c.image,
    courseCategoryId: c.courseCategoryId !== null ? String(c.courseCategoryId) : null,
    instructorId: c.instructorId !== null ? String(c.instructorId) : null,
    categoryName: c.category?.name ?? null,
    instructorName: c.instructor?.name ?? null,
    durationLabel: c.durationLabel,
    level: c.level,
    price: c.price,
    originalPrice: c.originalPrice,
    isFeatured: c.isFeatured,
    status: c.status,
    publishedAt: c.publishedAt?.toISOString() ?? null,
    sortOrder: c.sortOrder,
    metaTitle: c.metaTitle,
    metaDescription: c.metaDescription,
    enrollmentCount: c._count.enrollments,
    createdAt: c.createdAt.toISOString(),
    chapters: c.chapters.map((ch) => ({
      id: String(ch.id),
      title: ch.title,
      description: ch.description,
      durationLabel: ch.durationLabel,
      sortOrder: ch.sortOrder,
      lessons: ch.lessons.map((l) => ({
        id: String(l.id),
        title: l.title,
        description: l.description,
        videoUrl: l.videoUrl,
        attachment: l.attachment,
        durationSeconds: l.durationSeconds,
        isFreePreview: l.isFreePreview,
        sortOrder: l.sortOrder,
      })),
    })),
    faqs: c.faqs.map((f) => ({ id: String(f.id), question: f.question, answer: f.answer, sortOrder: f.sortOrder })),
    features: c.features.map((f) => ({ id: String(f.id), type: f.type, title: f.title, sortOrder: f.sortOrder })),
    related: c.relatedAsSource.map((r) => String(r.relatedCourseId)),
    tagIds: c.tags.map((t) => String(t.tag.id)),
    tagNames: c.tags.map((t) => t.tag.name),
  }));

  return (
    <div>
      <PageTitle title="دوره‌ها" description="مدیریت دوره‌های آموزشی؛ شامل سرفصل‌ها، دروس، FAQ، ویژگی‌ها و برچسب‌ها" />

      <Card>
        <CardHeader
          title="لیست دوره‌ها"
          description={`${rows.length.toLocaleString('fa-IR')} مورد`}
          actions={
            <div className="flex items-center gap-2">
              <form action="/admins/courses" method="get" className="flex items-center gap-2">
                {q ? <input type="hidden" name="status" value={status ?? 'all'} /> : null}
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="جستجو…"
                  className="h-9 w-48 rounded-lg border border-cloud-300 bg-white px-3 text-[12.5px] outline-none placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
                />
                <AButton variant="outline" type="submit" className="h-9">
                  جستجو
                </AButton>
              </form>
            </div>
          }
        />
        <CoursesManager
          rows={rows}
          courseCategories={courseCategories.map((c) => ({ id: String(c.id), name: c.name }))}
          instructors={instructors.map((i) => ({ id: String(i.id), name: i.name }))}
          tags={tags.map((t) => ({ id: String(t.id), name: t.name }))}
          courseOptions={allCourses.map((c) => ({ id: String(c.id), title: c.title }))}
        />
      </Card>
    </div>
  );
}
