import { prisma } from '@/app/lib/prisma';
import { PageTitle, Card, CardHeader } from '@/app/admins/_components/kit';
import { InboxManager, type InboxRow } from '@/app/admins/_components/InboxManager';
import { updateContactMessage, deleteContactMessage } from './actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'پیام‌ها' };

export default async function MessagesPage() {
  const [messages, admins] = await Promise.all([
    prisma.contactMessage.findMany({
      orderBy: [{ createdAt: 'desc' }],
      include: {
        user: { select: { name: true } },
        admin: { select: { name: true } },
      },
    }),
    prisma.admin.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ]);

  const rows: InboxRow[] = messages.map((m) => ({
    id: String(m.id),
    title: m.subject,
    subtitle: m.mobile,
    body: m.message,
    status: m.status,
    adminNote: m.adminNote,
    handledBy: m.handledBy !== null ? String(m.handledBy) : null,
    handledByName: m.admin?.name ?? null,
    details: [
      { label: 'نام', value: m.name },
      { label: 'ایمیل', value: m.email },
      { label: 'کاربر', value: m.user?.name ?? null },
      { label: 'آدرس IP', value: m.ipAddress },
      { label: 'یادداشت داخلی', value: m.adminNote },
    ],
    createdAt: m.createdAt.toISOString(),
  }));

  const statuses = [
    { value: 'new' },
    { value: 'read' },
    { value: 'replied' },
    { value: 'archived' },
  ];

  return (
    <div>
      <PageTitle
        title="پیام‌های تماس"
        description="پیام‌های ثبت‌شده از فرم تماس با ما"
      />
      <Card>
        <CardHeader title="لیست پیام‌ها" description={`${rows.length.toLocaleString('fa-IR')} مورد`} />
        <InboxManager
          rows={rows}
          statuses={statuses}
          admins={admins.map((a) => ({ id: String(a.id), name: a.name }))}
          update={updateContactMessage}
          remove={deleteContactMessage}
          filterLabel="وضعیت پیام"
        />
      </Card>
    </div>
  );
}
