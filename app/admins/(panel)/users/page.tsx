import { prisma } from '@/app/lib/prisma';
import { PageTitle, Card, CardHeader } from '@/app/admins/_components/kit';
import { UsersManager, type UserRow, type CourseOption, type WalletTxRow } from './_UsersManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'کاربران' };

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? '').trim();

  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q } },
            { mobile: { contains: q } },
            { email: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      wallets: true,
      enrollments: {
        include: { course: { select: { title: true } } },
        orderBy: { createdAt: 'desc' },
      },
      _count: { select: { invoices: true, transactions: true } },
    },
  });

  const courses = await prisma.course.findMany({
    orderBy: { title: 'asc' },
    select: { id: true, title: true },
  });

  // Latest wallet transactions for the wallets we are displaying
  const userIds = users.map((u) => u.id);
  const walletTxs = userIds.length
    ? await prisma.walletTransaction.findMany({
        where: { userId: { in: userIds } },
        orderBy: { createdAt: 'desc' },
        take: 100,
        select: {
          id: true,
          userId: true,
          type: true,
          amount: true,
          balanceAfter: true,
          description: true,
          createdAt: true,
          admin: { select: { name: true } },
        },
      })
    : [];

  const txByUser = new Map<bigint, WalletTxRow[]>();
  for (const tx of walletTxs) {
    const key = tx.userId;
    const list = txByUser.get(key) ?? [];
    list.push({
      id: String(tx.id),
      type: tx.type,
      amount: tx.amount,
      balanceAfter: tx.balanceAfter,
      description: tx.description,
      adminName: tx.admin?.name ?? null,
      createdAt: tx.createdAt.toISOString(),
    });
    txByUser.set(key, list);
  }

  const rows: UserRow[] = users.map((u) => ({
    id: String(u.id),
    name: u.name,
    mobile: u.mobile,
    email: u.email,
    bio: u.bio,
    avatar: u.avatar,
    isActive: u.isActive,
    hasPassword: u.password !== null,
    mobileVerifiedAt: u.mobileVerifiedAt?.toISOString() ?? null,
    emailVerifiedAt: u.emailVerifiedAt?.toISOString() ?? null,
    lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
    createdAt: u.createdAt.toISOString(),
    walletBalance: u.wallets[0]?.balance ?? 0,
    invoiceCount: u._count.invoices,
    transactionCount: u._count.transactions,
    enrollments: u.enrollments.map((e) => ({
      id: String(e.id),
      courseTitle: e.course.title,
      status: e.status,
      expiresAt: e.expiresAt?.toISOString() ?? null,
      createdAt: e.createdAt.toISOString(),
    })),
    walletTransactions: txByUser.get(u.id) ?? [],
  }));

  const courseOptions: CourseOption[] = courses.map((c) => ({
    id: String(c.id),
    title: c.title,
  }));

  return (
    <div>
      <PageTitle
        title="کاربران"
        description="مدیریت کاربران سایت؛ کیف‌پول، ثبت‌نام‌ها و تراکنش‌ها"
      />
      <Card>
        <CardHeader
          title="لیست کاربران"
          description={`${rows.length.toLocaleString('fa-IR')} مورد`}
          actions={
            q ? (
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-ink-500">جستجو: «{q}»</span>
              </div>
            ) : undefined
          }
        />
        <UsersManager rows={rows} courses={courseOptions} query={q} />
      </Card>
    </div>
  );
}
