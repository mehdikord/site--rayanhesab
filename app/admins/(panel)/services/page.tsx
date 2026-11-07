import { prisma } from '@/app/lib/prisma';
import { PageTitle, AButton, ALinkButton, Card, CardHeader } from '@/app/admins/_components/kit';
import { ServicesManager, type ServiceRow, type ServiceOption } from './_ServicesManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'خدمات' };

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? '').trim();

  const services = await prisma.service.findMany({
    where: q
      ? {
          OR: [
            { title: { contains: q } },
            { slug: { contains: q } },
            { shortTitle: { contains: q } },
          ],
        }
      : undefined,
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    include: {
      features: { orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }] },
      faqs: { orderBy: { sortOrder: 'asc' } },
      steps: { orderBy: { sortOrder: 'asc' } },
      relatedAsSource: {
        select: { relatedServiceId: true },
      },
      _count: { select: { consultations: true } },
    },
  });

  const rows: ServiceRow[] = services.map((s) => ({
    id: String(s.id),
    title: s.title,
    slug: s.slug,
    shortTitle: s.shortTitle,
    excerpt: s.excerpt,
    icon: s.icon,
    image: s.image,
    accent: s.accent,
    sortOrder: s.sortOrder,
    isActive: s.isActive,
    metaTitle: s.metaTitle,
    metaDescription: s.metaDescription,
    consultationCount: s._count.consultations,
    features: s.features.map((f) => ({
      id: String(f.id),
      type: f.type,
      title: f.title,
      description: f.description,
      sortOrder: f.sortOrder,
    })),
    faqs: s.faqs.map((f) => ({
      id: String(f.id),
      question: f.question,
      answer: f.answer,
      sortOrder: f.sortOrder,
    })),
    steps: s.steps.map((st) => ({
      id: String(st.id),
      title: st.title,
      description: st.description,
      sortOrder: st.sortOrder,
    })),
    related: s.relatedAsSource.map((r) => String(r.relatedServiceId)),
    createdAt: s.createdAt.toISOString(),
  }));

  const options: ServiceOption[] = rows.map((r) => ({ id: r.id, title: r.title }));

  return (
    <div>
      <PageTitle
        title="خدمات"
        description="مدیریت خدمات تخصصی سایت؛ شامل ویژگی‌ها، پرسش‌های پرتکرار، مراحل فرایند و خدمات مرتبط"
      />

      <Card>
        <CardHeader
          title="لیست خدمات"
          description={`${rows.length.toLocaleString('fa-IR')} مورد`}
          actions={
            <form action="/admins/services" method="get" className="flex items-center gap-2">
              <input
                name="q"
                defaultValue={q}
                placeholder="جستجو بر اساس عنوان یا slug…"
                className="h-9 w-56 rounded-lg border border-cloud-300 bg-white px-3 text-[12.5px] outline-none placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
              />
              <AButton variant="outline" type="submit">
                جستجو
              </AButton>
              {q ? <ALinkButton href="/admins/services">پاک‌سازی</ALinkButton> : null}
            </form>
          }
        />
        <ServicesManager rows={rows} options={options} />
      </Card>
    </div>
  );
}
