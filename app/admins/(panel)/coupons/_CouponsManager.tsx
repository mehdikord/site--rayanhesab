'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, LoaderCircle } from 'lucide-react';
import {
  TableCard,
  Td,
  EmptyRow,
  AButton,
  AField,
  AInput,
  ASelect,
  ACheckbox,
  Notice,
  fmtDateOnly,
} from '@/app/admins/_components/kit';
import { toLocalInputValue } from '@/app/lib/datetime';
import { Modal } from '@/app/admins/_components/Modal';
import { ConfirmDelete, type ActionResult } from '@/app/admins/_components/Confirm';
import { useSaveAction } from '@/app/admins/_components/useSaveAction';
import { upsertCoupon, deleteCoupon, saveCouponCourses } from './actions';

export interface CouponRow {
  id: string;
  code: string;
  title: string | null;
  type: string;
  value: number;
  maxDiscount: number | null;
  minOrderAmount: number | null;
  usageLimit: number | null;
  usageLimitPerUser: number | null;
  usedCount: number;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  courseIds: string[];
}
export interface CourseOption {
  id: string;
  title: string;
}

const typeLabel: Record<string, string> = {
  percent: 'درصدی',
  fixed: 'مقطوع',
};

function fmtValue(c: CouponRow): string {
  if (c.type === 'percent') {
    let s = `${c.value.toLocaleString('fa-IR')}٪`;
    if (c.maxDiscount) s += ` (حداکثر ${c.maxDiscount.toLocaleString('fa-IR')} تومان)`;
    return s;
  }
  return `${c.value.toLocaleString('fa-IR')} تومان`;
}

export function CouponsManager({ rows, courses }: { rows: CouponRow[]; courses: CourseOption[] }) {
  const [editing, setEditing] = useState<CouponRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<CouponRow | null>(null);

  return (
    <div className="space-y-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[12.5px] text-ink-500">کوپن‌های تخفیف قابل استفاده هنگام خرید دوره.</p>
        <AButton onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> افزودن کوپن
        </AButton>
      </div>

      <TableCard columns={['کد', 'نوع', 'مقدار', 'محدودیت', 'استفاده', 'وضعیت', 'عملیات']}>
        {rows.length === 0 ? (
          <EmptyRow colSpan={7} label="هنوز کوپنی ثبت نشده است" />
        ) : (
          rows.map((r) => (
            <tr key={r.id} className="transition-colors hover:bg-cloud-100/60">
              <Td>
                <p className="font-extrabold text-navy-900" dir="ltr">{r.code}</p>
                {r.title ? <p className="text-[11.5px] text-ink-400">{r.title}</p> : null}
              </Td>
              <Td>{typeLabel[r.type] ?? r.type}</Td>
              <Td className="whitespace-nowrap">{fmtValue(r)}</Td>
              <Td className="whitespace-nowrap text-[12px] text-ink-500">
                {r.usageLimit !== null ? `کل ${r.usageLimit.toLocaleString('fa-IR')} بار` : 'نامحدود'}
                {r.usageLimitPerUser ? ` · هر کاربر ${r.usageLimitPerUser.toLocaleString('fa-IR')} بار` : ''}
              </Td>
              <Td>
                <span className="font-bold text-navy-900">{r.usedCount.toLocaleString('fa-IR')}</span>
                <span className="text-[11.5px] text-ink-400"> بار</span>
              </Td>
              <Td>
                <span
                  className={
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11.5px] font-bold ring-1 ring-inset ' +
                    (r.isActive
                      ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                      : 'bg-cloud-200 text-ink-500 ring-cloud-400/40')
                  }
                >
                  {r.isActive ? 'فعال' : 'غیرفعال'}
                </span>
                {r.startsAt ? (
                  <p className="mt-1 text-[10.5px] text-ink-400">شروع: {fmtDateOnly(r.startsAt)}</p>
                ) : null}
                {r.expiresAt ? (
                  <p className="text-[10.5px] text-ink-400">انقضا: {fmtDateOnly(r.expiresAt)}</p>
                ) : null}
              </Td>
              <Td>
                <div className="flex items-center gap-1.5">
                  <AButton variant="outline" className="h-8 px-2.5" onClick={() => setEditing(r)}>
                    <Pencil className="h-3.5 w-3.5" /> ویرایش
                  </AButton>
                  <AButton
                    variant="danger"
                    className="h-8 px-2.5 border-0 bg-red-50 text-red-600 hover:bg-red-100"
                    onClick={() => setDeleting(r)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </AButton>
                </div>
              </Td>
            </tr>
          ))
        )}
      </TableCard>

      <CouponModal
        open={creating}
        onClose={() => setCreating(false)}
        courses={courses}
      />
      <CouponModal
        open={editing !== null}
        onClose={() => setEditing(null)}
        initial={editing ?? undefined}
        courses={courses}
      />
      <ConfirmDelete
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        label={`کوپن «${deleting?.code ?? ''}» حذف شود؟`}
        action={async (): Promise<ActionResult> => deleteCoupon(deleting?.id ?? '')}
      />
    </div>
  );
}

/* ───────────────────────── Coupon modal ───────────────────────── */

function CouponModal({
  open,
  onClose,
  initial,
  courses,
}: {
  open: boolean;
  onClose: () => void;
  initial?: CouponRow;
  courses: CourseOption[];
}) {
  const c = initial;
  const main = useSaveAction(upsertCoupon);
  const coursesApi = useSaveAction(saveCouponCourses);

  return (
    <Modal open={open} onClose={onClose} title={c ? 'ویرایش کوپن' : 'افزودن کوپن'} wide>
      <div className="space-y-5">
        {/* Main fields */}
        <form onSubmit={main.onSubmit} className="space-y-4">
          <input type="hidden" name="id" value={c?.id ?? ''} />
          {main.error ? <Notice tone="error">{main.error}</Notice> : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AField label="کد کوپن" required hint="حروف بزرگ انگلیسی؛ مثل WELCOME10">
              <AInput name="code" defaultValue={c?.code} dir="ltr" required className="text-left" />
            </AField>
            <AField label="عنوان نمایشی">
              <AInput name="title" defaultValue={c?.title ?? ''} />
            </AField>
            <AField label="نوع">
              <ASelect name="type" defaultValue={c?.type ?? 'percent'}>
                <option value="percent">درصدی</option>
                <option value="fixed">مقطوع (تومان)</option>
              </ASelect>
            </AField>
            <AField label="مقدار" required hint="درصد برای نوع درصدی، تومان برای نوع مقطوع">
              <AInput name="value" type="number" min={0} defaultValue={String(c?.value ?? 0)} dir="ltr" required className="text-left" />
            </AField>
            <AField label="حداکثر تخفیف (تومان)" hint="فقط برای کوپن درصدی">
              <AInput name="maxDiscount" type="number" min={0} defaultValue={String(c?.maxDiscount ?? '')} dir="ltr" className="text-left" />
            </AField>
            <AField label="حداقل مبلغ سفارش (تومان)">
              <AInput name="minOrderAmount" type="number" min={0} defaultValue={String(c?.minOrderAmount ?? '')} dir="ltr" className="text-left" />
            </AField>
            <AField label="محدودیت استفاده کل" hint="خالی = نامحدود">
              <AInput name="usageLimit" type="number" min={0} defaultValue={String(c?.usageLimit ?? '')} dir="ltr" className="text-left" />
            </AField>
            <AField label="محدودیت استفاده هر کاربر" hint="خالی = نامحدود">
              <AInput name="usageLimitPerUser" type="number" min={0} defaultValue={String(c?.usageLimitPerUser ?? '')} dir="ltr" className="text-left" />
            </AField>
            <AField label="زمان شروع">
              <AInput name="startsAt" type="datetime-local" defaultValue={toLocalInputValue(c?.startsAt)} dir="ltr" className="text-left" />
            </AField>
            <AField label="زمان انقضا">
              <AInput name="expiresAt" type="datetime-local" defaultValue={toLocalInputValue(c?.expiresAt)} dir="ltr" className="text-left" />
            </AField>
            <div>
              <ACheckbox name="isActive" defaultChecked={c ? c.isActive : true} label="فعال" />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <AButton variant="outline" type="button" onClick={onClose}>انصراف</AButton>
            <AButton type="submit" disabled={main.pending}>
              {main.pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              {c ? 'ذخیره تغییرات' : 'ایجاد کوپن'}
            </AButton>
          </div>
        </form>

        {/* Course applicability */}
        {c ? (
          <form onSubmit={coursesApi.onSubmit} className="space-y-3 border-t border-cloud-200 pt-4">
            <input type="hidden" name="couponId" value={c.id} />
            {coursesApi.success ? <Notice tone="success">دوره‌های قابل استفاده ذخیره شد.</Notice> : null}
            {coursesApi.error ? <Notice tone="error">{coursesApi.error}</Notice> : null}
            <p className="text-[12.5px] font-bold text-navy-800">دوره‌های قابل استفاده با این کوپن</p>
            {courses.length === 0 ? (
              <p className="text-[12.5px] text-ink-500">دوره‌ای وجود ندارد.</p>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {courses.map((o) => {
                  const isChecked = c.courseIds.includes(o.id);
                  return (
                    <label
                      key={o.id}
                      className={
                        'flex items-center gap-2.5 rounded-lg border px-3 py-2.5 transition-colors ' +
                        (isChecked
                          ? 'border-brand-400 bg-brand-50/60'
                          : 'border-cloud-300 bg-white hover:bg-cloud-100')
                      }
                    >
                      <input type="hidden" name={`course:${o.id}`} value="0" />
                      <ACheckbox name={`course:${o.id}`} defaultChecked={isChecked} />
                      <span className="text-[13px] font-semibold text-navy-900">{o.title}</span>
                    </label>
                  );
                })}
              </div>
            )}
            <div className="flex justify-end">
              <AButton type="submit" variant="outline" disabled={coursesApi.pending}>
                {coursesApi.pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                ذخیره دوره‌های قابل استفاده
              </AButton>
            </div>
          </form>
        ) : null}
      </div>
    </Modal>
  );
}
