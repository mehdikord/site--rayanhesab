'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, LoaderCircle } from 'lucide-react';
import {
  Td,
  EmptyRow,
  AButton,
  AField,
  AInput,
  ACheckbox,
  StatusPill,
  fmtDateOnly,
} from '@/app/admins/_components/kit';
import { TableBare } from '@/app/admins/_components/kit';
import { Modal } from '@/app/admins/_components/Modal';
import { ConfirmDelete, type ActionResult } from '@/app/admins/_components/Confirm';
import { useSaveAction } from '@/app/admins/_components/useSaveAction';
import { upsertAdmin, deleteAdmin } from './actions';

export interface AdminRow {
  id: string;
  name: string;
  mobile: string;
  email: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export function AdminsManager({
  rows,
  currentAdminId,
}: {
  rows: AdminRow[];
  currentAdminId: string;
}) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AdminRow | null>(null);
  const [deleting, setDeleting] = useState<AdminRow | null>(null);

  return (
    <div className="space-y-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[12.5px] text-ink-500">
          همهٔ مدیران به کل بخش‌های پنل دسترسی دارند؛ نقش تعریف نشده است.
        </p>
        <AButton onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> افزودن مدیر
        </AButton>
      </div>

      <TableBare columns={['مدیر', 'موبایل', 'وضعیت', 'آخرین ورود', 'تأسیس', 'عملیات']}>
        {rows.length === 0 ? (
          <EmptyRow colSpan={6} label="مدیری ثبت نشده است" />
        ) : (
          rows.map((r) => {
            const isSelf = r.id === currentAdminId;
            return (
              <tr key={r.id} className="transition-colors hover:bg-cloud-100/60">
                <Td>
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-[13px] font-black text-brand-700">
                      {r.name.trim().charAt(0) || 'م'}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-extrabold text-navy-900">
                        {r.name}
                        {isSelf ? (
                          <span className="mr-2 text-[11px] font-bold text-brand-600">(شما)</span>
                        ) : null}
                      </p>
                      <p className="truncate text-[11.5px] text-ink-400" dir="ltr">
                        {r.email}
                      </p>
                    </div>
                  </div>
                </Td>
                <Td>
                  <span dir="ltr" className="text-[12.5px]">
                    {r.mobile}
                  </span>
                </Td>
                <Td>
                  <StatusPill value={r.isActive ? 'active' : 'archived'} />
                </Td>
                <Td className="whitespace-nowrap text-[12px] text-ink-500">
                  {r.lastLoginAt ? fmtDateOnly(r.lastLoginAt) : '—'}
                </Td>
                <Td className="whitespace-nowrap text-[12px] text-ink-500">
                  {fmtDateOnly(r.createdAt)}
                </Td>
                <Td>
                  <div className="flex items-center gap-1.5">
                    <AButton variant="outline" className="h-8 px-2.5" onClick={() => setEditing(r)}>
                      <Pencil className="h-3.5 w-3.5" /> ویرایش
                    </AButton>
                    <AButton
                      variant="danger"
                      className="h-8 px-2.5 border-0 bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-40 disabled:hover:bg-red-50"
                      disabled={isSelf}
                      title={isSelf ? 'نمی‌توانید حساب خود را حذف کنید' : undefined}
                      onClick={() => setDeleting(r)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </AButton>
                  </div>
                </Td>
              </tr>
            );
          })
        )}
      </TableBare>

      <AdminModal open={creating} onClose={() => setCreating(false)} />
      <AdminModal
        open={editing !== null}
        onClose={() => setEditing(null)}
        initial={editing ?? undefined}
        isSelf={editing?.id === currentAdminId}
      />
      <ConfirmDelete
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        label={`حساب «${deleting?.name ?? ''}» حذف شود؟ (رکوردهای وابسته به مدیریت، مالکیت خود را از دست می‌دهند)`}
        action={async (): Promise<ActionResult> => deleteAdmin(deleting?.id ?? '')}
      />
    </div>
  );
}

function AdminModal({
  open,
  onClose,
  initial,
  isSelf,
}: {
  open: boolean;
  onClose: () => void;
  initial?: AdminRow;
  isSelf?: boolean;
}) {
  const a = initial;
  const api = useSaveAction(upsertAdmin);

  useEffect(() => {
    if (open) api.reset();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={a ? `ویرایش مدیر: ${a.name}` : 'افزودن مدیر'}
    >
      <form onSubmit={api.onSubmit} className="space-y-4">
        <input type="hidden" name="id" value={a?.id ?? ''} />
        {api.success ? (
          <p className="text-[12.5px] font-bold text-emerald-700">ذخیره شد.</p>
        ) : null}
        {api.error ? <p className="text-[12.5px] font-bold text-red-600">{api.error}</p> : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AField label="نام و نام خانوادگی" required>
            <AInput name="name" defaultValue={a?.name} required />
          </AField>
          <AField label="موبایل" required>
            <AInput
              name="mobile"
              defaultValue={a?.mobile}
              dir="ltr"
              className="text-left"
              required
            />
          </AField>
          <AField label="ایمیل" required>
            <AInput
              name="email"
              type="email"
              defaultValue={a?.email ?? ''}
              dir="ltr"
              className="text-left"
              required
            />
          </AField>
          <AField
            label={a ? 'تغییر رمز عبور' : 'رمز عبور'}
            required={!a}
            hint={
              a
                ? 'خالی بگذارید تا رمز فعلی حفظ شود'
                : 'حداقل ۶ کاراکتر؛ پس از ذخیره قابل تغییر است'
            }
          >
            <AInput
              name="password"
              type="password"
              dir="ltr"
              className="text-left"
              autoComplete="new-password"
              minLength={a ? undefined : 6}
            />
          </AField>
          <div>
            <ACheckbox
              name="isActive"
              defaultChecked={a ? a.isActive : true}
              disabled={isSelf}
              label="فعال"
              className={isSelf ? 'opacity-50' : undefined}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-cloud-200 pt-4">
          <AButton variant="outline" type="button" onClick={onClose}>
            انصراف
          </AButton>
          <AButton type="submit" disabled={api.pending}>
            {api.pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            {a ? 'ذخیره تغییرات' : 'ایجاد مدیر'}
          </AButton>
        </div>
      </form>
    </Modal>
  );
}
