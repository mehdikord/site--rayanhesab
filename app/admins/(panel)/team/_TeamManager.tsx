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
  fmtDateOnly,
} from '@/app/admins/_components/kit';
import { ImageField } from '@/app/admins/_components/ImageField';
import { Modal } from '@/app/admins/_components/Modal';
import { ConfirmDelete, type ActionResult } from '@/app/admins/_components/Confirm';
import { useSaveAction } from '@/app/admins/_components/useSaveAction';
import { upsertTeamMember, deleteTeamMember } from './actions';

export interface TeamRow {
  id: string;
  slug: string;
  name: string;
  role: string;
  expertise: string | null;
  image: string | null;
  bio: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export function TeamManager({ rows }: { rows: TeamRow[] }) {
  const [editing, setEditing] = useState<TeamRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<TeamRow | null>(null);

  return (
    <div className="space-y-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12.5px] text-ink-500">اعضای تیم در صفحه «درباره ما» نمایش داده می‌شوند.</p>
        <AButton onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> افزودن عضو
        </AButton>
      </div>

      <TableCard columns={['اعضا', 'نقش', 'حوزه تخصص', 'ترتیب', 'وضعیت', 'تاریخ', 'عملیات']}>
        {rows.length === 0 ? (
          <EmptyRow colSpan={7} label="هنوز عضوی ثبت نشده است" />
        ) : (
          rows.map((r) => (
            <tr key={r.id} className="transition-colors hover:bg-cloud-100/60">
              <Td>
                <p className="font-extrabold text-navy-900">{r.name}</p>
                <p className="text-[11.5px] text-ink-400" dir="ltr">{`slug: ${r.slug}`}</p>
              </Td>
              <Td>{r.role}</Td>
              <Td className="max-w-48 truncate text-ink-500">{r.expertise ?? '—'}</Td>
              <Td>{r.sortOrder.toLocaleString('fa-IR')}</Td>
              <Td><StatusPill value={r.isActive ? 'active' : 'archived'} /></Td>
              <Td className="whitespace-nowrap text-ink-500">{fmtDateOnly(r.createdAt)}</Td>
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

      <TeamModal open={creating} onClose={() => setCreating(false)} />
      <TeamModal
        open={editing !== null}
        onClose={() => setEditing(null)}
        initial={editing ?? undefined}
      />
      <ConfirmDelete
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        label={`«${deleting?.name ?? ''}» از تیم حذف شود؟`}
        action={async (): Promise<ActionResult> => deleteTeamMember(deleting?.id ?? '')}
      />
    </div>
  );
}

function TeamModal({ open, onClose, initial }: { open: boolean; onClose: () => void; initial?: TeamRow }) {
  const m = initial;
  const api = useSaveAction(upsertTeamMember);

  return (
    <Modal open={open} onClose={onClose} title={m ? 'ویرایش عضو' : 'افزودن عضو تیم'}>
      <form onSubmit={api.onSubmit} className="space-y-4">
        <input type="hidden" name="id" value={m?.id ?? ''} />
        {api.error ? <Notice tone="error">{api.error}</Notice> : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AField label="نام و نام خانوادگی" required>
            <AInput name="name" defaultValue={m?.name} required />
          </AField>
          <AField label="Slug" required hint="با خط تیره؛ مثل mehdi-rahimi">
            <AInput name="slug" defaultValue={m?.slug} dir="ltr" required className="text-left" />
          </AField>
          <AField label="نقش" required>
            <AInput name="role" defaultValue={m?.role} required />
          </AField>
          <AField label="حوزه تخصص">
            <AInput name="expertise" defaultValue={m?.expertise ?? ''} />
          </AField>
          <AField label="تصویر" className="sm:col-span-2" hint="JPG، PNG یا WebP — حداکثر ۵ مگابایت">
            <ImageField name="image" defaultValue={m?.image} folder="team" />
          </AField>
          <AField label="بیوگرافی" className="sm:col-span-2">
            <ATextarea name="bio" rows={4} defaultValue={m?.bio ?? ''} />
          </AField>
          <AField label="ترتیب نمایش">
            <AInput name="sortOrder" type="number" min={0} defaultValue={String(m?.sortOrder ?? 0)} dir="ltr" className="text-left" />
          </AField>
          <div>
            <ACheckbox name="isActive" defaultChecked={m ? m.isActive : true} label="فعال و قابل نمایش" />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-cloud-200 pt-4">
          <AButton variant="outline" type="button" onClick={onClose}>انصراف</AButton>
          <AButton type="submit" disabled={api.pending}>
            {api.pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            {m ? 'ذخیره تغییرات' : 'ایجاد عضو'}
          </AButton>
        </div>
      </form>
    </Modal>
  );
}
