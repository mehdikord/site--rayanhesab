import { prisma } from '@/app/lib/prisma';
import { PageTitle, Card, CardHeader } from '@/app/admins/_components/kit';
import { TeamManager, type TeamRow } from './_TeamManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'تیم' };

export default async function TeamPage() {
  const members = await prisma.teamMember.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });

  const rows: TeamRow[] = members.map((m) => ({
    id: String(m.id),
    slug: m.slug,
    name: m.name,
    role: m.role,
    expertise: m.expertise,
    image: m.image,
    bio: m.bio,
    sortOrder: m.sortOrder,
    isActive: m.isActive,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <div>
      <PageTitle
        title="تیم"
        description="مدیریت اعضای تیم نمایش‌داده‌شده در بخش درباره ما"
      />
      <Card>
        <CardHeader title="اعضای تیم" description={`${rows.length.toLocaleString('fa-IR')} مورد`} />
        <TeamManager rows={rows} />
      </Card>
    </div>
  );
}
