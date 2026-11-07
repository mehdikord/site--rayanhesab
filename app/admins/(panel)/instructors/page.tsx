import { prisma } from '@/app/lib/prisma';
import { PageTitle, Card, CardHeader } from '@/app/admins/_components/kit';
import { InstructorsManager, type InstructorRow } from './_InstructorsManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'اساتید' };

export default async function InstructorsPage() {
  const instructors = await prisma.instructor.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { courses: true } } },
  });

  const rows: InstructorRow[] = instructors.map((i) => ({
    id: String(i.id),
    name: i.name,
    title: i.title,
    bio: i.bio,
    avatar: i.avatar,
    isActive: i.isActive,
    courseCount: i._count.courses,
    createdAt: i.createdAt.toISOString(),
  }));

  return (
    <div>
      <PageTitle
        title="اساتید"
        description="مدیریت اساتید آموزشی که در دوره‌ها استفاده می‌شوند"
      />
      <Card>
        <CardHeader title="لیست اساتید" description={`${rows.length.toLocaleString('fa-IR')} مورد`} />
        <InstructorsManager rows={rows} />
      </Card>
    </div>
  );
}
