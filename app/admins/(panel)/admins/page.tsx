import { prisma } from '@/app/lib/prisma';
import { requireAdmin } from '@/app/admins/lib/auth';
import { PageTitle, Card, CardHeader } from '@/app/admins/_components/kit';
import { AdminsManager, type AdminRow } from './_AdminsManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'مدیران' };

export default async function AdminsPage() {
  const session = await requireAdmin();

  const admins = await prisma.admin.findMany({
    orderBy: [{ id: 'asc' }],
    select: {
      id: true,
      name: true,
      mobile: true,
      email: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });

  const rows: AdminRow[] = admins.map((a) => ({
    id: String(a.id),
    name: a.name,
    mobile: a.mobile,
    email: a.email,
    isActive: a.isActive,
    lastLoginAt: a.lastLoginAt?.toISOString() ?? null,
    createdAt: a.createdAt.toISOString(),
  }));

  return (
    <div>
      <PageTitle
        title="مدیران"
        description="مدیریت حساب‌های مدیریتی؛ همه مدیران دسترسی کامل دارند"
      />
      <Card>
        <CardHeader
          title="حساب‌های مدیری"
          description={`${rows.length.toLocaleString('fa-IR')} مورد`}
        />
        <AdminsManager rows={rows} currentAdminId={session.id} />
      </Card>
    </div>
  );
}
