import { prisma } from '@/app/lib/prisma';
import { PageTitle, Card, CardHeader } from '@/app/admins/_components/kit';
import { CouponsManager, type CouponRow, type CourseOption } from './_CouponsManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'کوپن‌ها' };

export default async function CouponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      courses: {
        select: { courseId: true, course: { select: { id: true, title: true } } },
      },
    },
  });

  const courses = await prisma.course.findMany({
    orderBy: { title: 'asc' },
    select: { id: true, title: true },
  });

  const rows: CouponRow[] = coupons.map((c) => ({
    id: String(c.id),
    code: c.code,
    title: c.title,
    type: c.type,
    value: c.value,
    maxDiscount: c.maxDiscount,
    minOrderAmount: c.minOrderAmount,
    usageLimit: c.usageLimit,
    usageLimitPerUser: c.usageLimitPerUser,
    usedCount: c.usedCount,
    startsAt: c.startsAt?.toISOString() ?? null,
    expiresAt: c.expiresAt?.toISOString() ?? null,
    isActive: c.isActive,
    courseIds: c.courses.map((cc) => String(cc.courseId)),
  }));

  const options: CourseOption[] = courses.map((co) => ({
    id: String(co.id),
    title: co.title,
  }));

  return (
    <div>
      <PageTitle
        title="کوپن‌های تخفیف"
        description="مدیریت کوپن‌های تخفیف و دوره‌های قابل استفاده با آن‌ها"
      />
      <Card>
        <CardHeader title="لیست کوپن‌ها" description={`${rows.length.toLocaleString('fa-IR')} مورد`} />
        <CouponsManager rows={rows} courses={options} />
      </Card>
    </div>
  );
}
