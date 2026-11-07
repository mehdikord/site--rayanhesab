'use client';

import { useState } from 'react';
import { Trash2, LoaderCircle, Eye } from 'lucide-react';
import {
  Td,
  EmptyRow,
  AButton,
  AField,
  ATextarea,
  ASelect,
  Notice,
  StatusPill,
  fmtDateOnly,
  faStatusLabel,
} from '@/app/admins/_components/kit';
import { TableBare } from '@/app/admins/_components/kit';
import { Modal } from '@/app/admins/_components/Modal';
import { ConfirmDelete, type ActionResult } from '@/app/admins/_components/Confirm';
import { useSaveAction } from '@/app/admins/_components/useSaveAction';

export interface InboxRow {
  id: string;
  /** primary display (name or subject) */
  title: string;
  /** secondary display (mobile / email) */
  subtitle: string | null;
  /** full message body */
  body: string;
  status: string;
  adminNote: string | null;
  handledBy: string | null;
  handledByName: string | null;
  /** extra context rows shown in the detail modal */
  details: { label: string; value: string | null }[];
  createdAt: string;
}

export interface StatusOption {
  value: string;
  label?: string;
}

/**
 * Generic inbox-style manager for request tables (consultations, contact
 * messages, job requests…). One detail/handle modal per row, status
 * filtering, and delete with confirmation.
 */
export function InboxManager({
  rows,
  statuses,
  admins,
  update,
  remove,
  filterLabel = 'وضعیت',
  emptyLabel = 'موردی ثبت نشده است',
}: {
  rows: InboxRow[];
  statuses: StatusOption[];
  admins: { id: string; name: string }[];
  update: (fd: FormData) => Promise<ActionResult>;
  remove: (id: string) => Promise<ActionResult>;
  filterLabel?: string;
  emptyLabel?: string;
}) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [opening, setOpening] = useState<InboxRow | null>(null);
  const [deleting, setDeleting] = useState<InboxRow | null>(null);

  const filtered = rows.filter((r) => {
    const ms = statusFilter === 'all' || r.status === statusFilter;
    const mq =
      query === '' ||
      r.title.toLowerCase().includes(query.toLowerCase()) ||
      (r.subtitle ?? '').toLowerCase().includes(query.toLowerCase());
    return ms && mq;
  });

  return (
    <div className="space-y-4 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="جستجو در نام / موبایل…"
          className="h-9 w-52 rounded-lg border border-cloud-300 bg-white px-3 text-[12.5px] outline-none placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-lg border border-cloud-300 bg-white px-3 text-[12.5px] text-navy-900 outline-none focus:border-brand-500"
        >
          <option value="all">همه ({rows.length.toLocaleString('fa-IR')})</option>
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label ?? faStatusLabel[s.value] ?? s.value}
            </option>
          ))}
        </select>
        <span className="text-[12px] text-ink-400">
          {filterLabel}: {filtered.length.toLocaleString('fa-IR')} مورد
        </span>
      </div>

      <TableBare columns={['درخواست', 'جزئیات', 'وضعیت', 'مسئول', 'تاریخ', 'عملیات']}>
        {filtered.length === 0 ? (
          <EmptyRow colSpan={6} label={query || statusFilter !== 'all' ? 'موردی با این فیلتر یافت نشد' : emptyLabel} />
        ) : (
          filtered.map((r) => (
            <tr key={r.id} className="transition-colors hover:bg-cloud-100/60">
              <Td>
                <p className="font-extrabold text-navy-900">{r.title}</p>
                {r.subtitle ? (
                  <p className="text-[11.5px] text-ink-400" dir="ltr">{r.subtitle}</p>
                ) : null}
              </Td>
              <Td>
                <p className="max-w-56 truncate text-[12px] text-ink-500">{r.body}</p>
              </Td>
              <Td><StatusPill value={r.status} /></Td>
              <Td className="text-[12.5px] text-ink-500">{r.handledByName ?? '—'}</Td>
              <Td className="whitespace-nowrap text-ink-500">{fmtDateOnly(r.createdAt)}</Td>
              <Td>
                <div className="flex items-center gap-1.5">
                  <AButton variant="outline" className="h-8 px-2.5" onClick={() => setOpening(r)}>
                    <Eye className="h-3.5 w-3.5" /> بررسی
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
      </TableBare>

      <HandleModal
        open={opening !== null}
        onClose={() => setOpening(null)}
        row={opening ?? undefined}
        statuses={statuses}
        admins={admins}
        update={update}
      />
      <ConfirmDelete
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        label={`درخواست «${deleting?.title ?? ''}» حذف شود؟`}
        action={async (): Promise<ActionResult> => remove(deleting?.id ?? '')}
      />
    </div>
  );
}

function HandleModal({
  open,
  onClose,
  row,
  statuses,
  admins,
  update,
}: {
  open: boolean;
  onClose: () => void;
  row?: InboxRow;
  statuses: StatusOption[];
  admins: { id: string; name: string }[];
  update: (fd: FormData) => Promise<ActionResult>;
}) {
  const api = useSaveAction(update);
  const r = row;

  return (
    <Modal open={open} onClose={onClose} title={r ? `درخواست ${r.title}` : ''} description={r?.subtitle ?? undefined}>
      {r ? (
        <div className="space-y-5">
          {/* Read-only context */}
          <div className="rounded-xl bg-cloud-100/70 p-4">
            {r.details.map((d) => (
              <div key={d.label} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-cloud-300/60 py-1.5 last:border-0">
                <span className="text-[12px] font-bold text-ink-500">{d.label}</span>
                <span className="text-[12.5px] font-semibold text-navy-900" dir="auto">
                  {d.value ?? '—'}
                </span>
              </div>
            ))}
            <p className="mt-3 whitespace-pre-wrap rounded-lg bg-white p-3 text-[13px] leading-6 text-navy-800">
              {r.body}
            </p>
          </div>

          {/* Handle form */}
          <form onSubmit={api.onSubmit} className="space-y-4">
            <input type="hidden" name="id" value={r.id} />
            {api.success ? <Notice tone="success">ذخیره شد.</Notice> : null}
            {api.error ? <Notice tone="error">{api.error}</Notice> : null}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <AField label="وضعیت">
                <ASelect name="status" defaultValue={r.status}>
                  {statuses.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label ?? faStatusLabel[s.value] ?? s.value}
                    </option>
                  ))}
                </ASelect>
              </AField>
              <AField label="مسئول پیگیری">
                <ASelect name="handledBy" defaultValue={r.handledBy ?? ''}>
                  <option value="">— بدون مسئول —</option>
                  {admins.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </ASelect>
              </AField>
              <AField label="یادداشت داخلی" className="sm:col-span-2">
                <ATextarea name="adminNote" rows={2} defaultValue={r.adminNote ?? ''} />
              </AField>
            </div>

            <div className="flex justify-end gap-2">
              <AButton variant="outline" type="button" onClick={onClose}>بستن</AButton>
              <AButton type="submit" disabled={api.pending}>
                {api.pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                ذخیره
              </AButton>
            </div>
          </form>
        </div>
      ) : null}
    </Modal>
  );
}
