import { prisma } from '@/app/lib/prisma';
import { PageTitle, Card, CardHeader } from '@/app/admins/_components/kit';
import { CategoriesManager, type CategoryRow, type TagRow } from './_CategoriesManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'دسته‌ها و برچسب‌ها' };

export default async function CategoriesPage() {
  const [articleCats, courseCats, tags] = await Promise.all([
    prisma.articleCategory.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { articles: true } } },
    }),
    prisma.courseCategory.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { courses: true } } },
    }),
    prisma.tag.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { courses: true } } },
    }),
  ]);

  const articleRows: CategoryRow[] = articleCats.map((c) => ({
    id: String(c.id),
    name: c.name,
    slug: c.slug,
    description: c.description,
    sortOrder: c.sortOrder,
    isActive: c.isActive,
    usageCount: c._count.articles,
  }));

  const courseRows: CategoryRow[] = courseCats.map((c) => ({
    id: String(c.id),
    name: c.name,
    slug: c.slug,
    description: c.description,
    sortOrder: c.sortOrder,
    isActive: c.isActive,
    usageCount: c._count.courses,
  }));

  const tagRows: TagRow[] = tags.map((t) => ({
    id: String(t.id),
    name: t.name,
    slug: t.slug,
    usageCount: t._count.courses,
  }));

  return (
    <div>
      <PageTitle
        title="دسته‌ها و برچسب‌ها"
        description="مدیریت دسته‌های مقالات، دسته‌های دوره‌ها و برچسب‌های آموزشی"
      />
      <Card>
        <CardHeader
          title="دسته‌ها و برچسب‌ها"
          description={`${(articleRows.length + courseRows.length + tagRows.length).toLocaleString('fa-IR')} مورد`}
        />
        <CategoriesManager
          articleCategories={articleRows}
          courseCategories={courseRows}
          tags={tagRows}
        />
      </Card>
    </div>
  );
}
