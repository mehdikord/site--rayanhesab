import { prisma } from '@/app/lib/prisma';
import { PageTitle, Card, CardHeader } from '@/app/admins/_components/kit';
import { ArticlesManager, type ArticleRow } from './_ArticlesManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'مقالات' };

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? '').trim();
  const status = params.status as 'all' | 'draft' | 'published' | 'archived' | undefined;

  const articles = await prisma.article.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { title: { contains: q } },
                { slug: { contains: q } },
                { authorName: { contains: q } },
              ],
            }
          : undefined,
        status && status !== 'all'
          ? { status: status as 'draft' | 'published' | 'archived' }
          : undefined,
      ].filter(Boolean) as never,
    },
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    include: {
      articleCategory: { select: { name: true } },
      admin: { select: { name: true } },
      relatedAsSource: { select: { relatedArticleId: true } },
    },
  });

  const [categories, admins, allArticles] = await Promise.all([
    prisma.articleCategory.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.admin.findMany({ orderBy: { name: 'asc' } }),
    prisma.article.findMany({ orderBy: { title: 'asc' }, select: { id: true, title: true } }),
  ]);

  const rows: ArticleRow[] = articles.map((a) => ({
    id: String(a.id),
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    body: a.body,
    image: a.image,
    authorName: a.authorName,
    authorRole: a.authorRole,
    readingTime: a.readingTime,
    viewsCount: a.viewsCount,
    status: a.status,
    publishedAt: a.publishedAt?.toISOString() ?? null,
    metaTitle: a.metaTitle,
    metaDescription: a.metaDescription,
    categoryId: a.articleCategoryId !== null ? String(a.articleCategoryId) : null,
    adminId: a.adminId !== null ? String(a.adminId) : null,
    categoryName: a.articleCategory?.name ?? null,
    adminName: a.admin?.name ?? null,
    related: a.relatedAsSource.map((r) => String(r.relatedArticleId)),
    createdAt: a.createdAt.toISOString(),
  }));

  return (
    <div>
      <PageTitle
        title="مقالات"
        description="مدیریت مقالات وبلاگ؛ شامل دسته‌ها، نویسنده، مقالات مرتبط و SEO"
      />

      <Card>
        <CardHeader
          title="لیست مقالات"
          description={`${rows.length.toLocaleString('fa-IR')} مورد`}
        />
        <ArticlesManager
          rows={rows}
          categories={categories.map((c) => ({ id: String(c.id), name: c.name }))}
          admins={admins.map((a) => ({ id: String(a.id), name: a.name }))}
          articleOptions={allArticles.map((a) => ({ id: String(a.id), title: a.title }))}
        />
      </Card>
    </div>
  );
}
