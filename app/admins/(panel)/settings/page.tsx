import { prisma } from '@/app/lib/prisma';
import { PageTitle, Card, CardHeader } from '@/app/admins/_components/kit';
import { SettingsManager, type SettingRow } from './_SettingsManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'تنظیمات' };

export default async function SettingsPage() {
  const settings = await prisma.setting.findMany({
    orderBy: [{ group: 'asc' }, { key: 'asc' }],
  });

  const rows: SettingRow[] = settings.map((s) => ({
    id: String(s.id),
    group: s.group,
    key: s.key,
    value: s.value,
    updatedAt: s.updatedAt.toISOString(),
  }));

  return (
    <div>
      <PageTitle
        title="تنظیمات"
        description="مقادیر کلید و مقدار تنظیمات سایت؛ تغییرات بلافاصله اعمال می‌شود"
      />
      <Card>
        <CardHeader
          title="تنظیمات سایت"
          description={`${rows.length.toLocaleString('fa-IR')} کلید`}
        />
        <SettingsManager rows={rows} />
      </Card>
    </div>
  );
}
