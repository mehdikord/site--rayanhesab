import { prisma } from '@/app/lib/prisma';
import { PageTitle, Card, CardHeader } from '@/app/admins/_components/kit';
import { InboxManager, type InboxRow } from '@/app/admins/_components/InboxManager';
import { updateConsultation, deleteConsultation } from './actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'مشاوره‌ها' };

export default async function ConsultationsPage() {
  const [requests, admins] = await Promise.all([
    prisma.consultationRequest.findMany({
      orderBy: [{ createdAt: 'desc' }],
      include: {
        service: { select: { title: true } },
        user: { select: { name: true } },
        admin: { select: { name: true } },
      },
    }),
    prisma.admin.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ]);

  const rows: InboxRow[] = requests.map((c) => ({
    id: String(c.id),
    title: c.name,
    subtitle: c.mobile,
    body: c.message,
    status: c.status,
    adminNote: c.adminNote,
    handledBy: c.handledBy !== null ? String(c.handledBy) : null,
    handledByName: c.admin?.name ?? null,
    details: [
      { label: 'کاربر', value: c.user?.name ?? null },
      { label: 'خدمت', value: c.service?.title ?? null },
      { label: 'آدرس IP', value: c.ipAddress },
      { label: 'یادداشت داخلی', value: c.adminNote },
    ],
    createdAt: c.createdAt.toISOString(),
  }));

  const statuses = [
    { value: 'new' },
    { value: 'in_progress' },
    { value: 'done' },
    { value: 'cancelled' },
  ];

  return (
    <div>
      <PageTitle
        title="درخواست‌های مشاوره"
        description="پاسخ‌گویی به درخواست‌های مشاورهٔ ثبت‌شده در سایت"
      />
      <Card>
        <CardHeader title="لیست درخواست‌ها" description={`${rows.length.toLocaleString('fa-IR')} مورد`} />
        <InboxManager
          rows={rows}
          statuses={statuses}
          admins={admins.map((a) => ({ id: String(a.id), name: a.name }))}
          update={updateConsultation}
          remove={deleteConsultation}
        />
      </Card>
    </div>
  );
}
