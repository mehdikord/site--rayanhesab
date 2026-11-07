'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, LoaderCircle } from 'lucide-react';
import {
  TableCard,
  Td,
  StatusPill,
  EmptyRow,
  AButton,
  AField,
  AInput,
  ATextarea,
  ACheckbox,
  Notice,
} from '@/app/admins/_components/kit';
import { ImageField } from '@/app/admins/_components/ImageField';
import { Modal } from '@/app/admins/_components/Modal';
import { ConfirmDelete, type ActionResult } from '@/app/admins/_components/Confirm';
import { useSaveAction } from '@/app/admins/_components/useSaveAction';
import { upsertInstructor, deleteInstructor } from './actions';

export interface InstructorRow {
  id: string;
  name: string;
  title: string | null;
  bio: string | null;
  avatar: string | null;
  isActive: boolean;
  courseCount: number;
  createdAt: string;
}

export function InstructorsManager({ rows }: { rows: InstructorRow[] }) {
  const [editing, setEditing] = useState<InstructorRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<InstructorRow | null>(null);

  return (
    <div className="space-y-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12.5px] text-ink-500">اساتید در صفحات دوره‌ها نمایش داده می‌شوند.</p>
        <AButton onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> افزودن استاد
        </AButton>
      </div>

      <TableCard columns={['استاد', 'عنوان شغلی', 'دوره', 'وضعیت', 'عملیات']}>
        {rows.length === 0 ? (
          <EmptyRow colSpan={5} label="هنوز استادی ثبت نشده است" />
        ) : (
          rows.map((r) => (
            <tr key={r.id} className="transition-colors hover:bg-cloud-100/60">
              <Td>
                <p className="font-extrabold text-navy-900">{r.name}</p>
              </Td>
              <Td>{r.title ?? '—'}</Td>
              <Td>{r.courseCount.toLocaleString('fa-IR')}</Td>
              <Td><StatusPill value={r.isActive ? 'active' : 'archived'} /></Td>
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

      <InstructorModal open={creating} onClose={() => setCreating(false)} />
      <InstructorModal
        open={editing !== null}
        onClose={() => setEditing(null)}
        initial={editing ?? undefined}
      />
      <ConfirmDelete
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        label={`«${deleting?.name ?? ''}» حذف شود؟`}
        action={async (): Promise<ActionResult> => deleteInstructor(deleting?.id ?? '')}
      />
    </div>
  );
}

function InstructorModal({
  open,
  onClose,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  initial?: InstructorRow;
}) {
  const i = initial;
  const api = useSaveAction(upsertInstructor);

  return (
    <Modal open={open} onClose={onClose} title={i ? 'ویرایش استاد' : 'افزودن استاد'}>
      <form onSubmit={api.onSubmit} className="space-y-4">
        <input type="hidden" name="id" value={i?.id ?? ''} />
        {api.error ? <Notice tone="error">{api.error}</Notice> : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AField label="نام و نام خانوادگی" required>
            <AInput name="name" defaultValue={i?.name} required />
          </AField>
          <AField label="عنوان شغلی">
            <AInput name="title" defaultValue={i?.title ?? ''} placeholder="مثلا: کارشناس حسابرسی" />
          </AField>
          <AField label="تصویر" className="sm:col-span-2" hint="JPG، PNG یا WebP — حداکثر ۵ مگابایت">
            <ImageField name="avatar" defaultValue={i?.avatar} folder="instructors" />
          </AField>
          <AField label="بیوگرافی" className="sm:col-span-2">
            <ATextarea name="bio" rows={4} defaultValue={i?.bio ?? ''} />
          </AField>
          <div>
            <ACheckbox name="isActive" defaultChecked={i ? i.isActive : true} label="فعال" />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-cloud-200 pt-4">
          <AButton variant="outline" type="button" onClick={onClose}>انصراف</AButton>
          <AButton type="submit" disabled={api.pending}>
            {api.pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            {i ? 'ذخیره تغییرات' : 'ایجاد استاد'}
          </AButton>
        </div>
      </form>
    </Modal>
  );
}
