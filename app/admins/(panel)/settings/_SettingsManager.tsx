'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, LoaderCircle, KeyRound } from 'lucide-react';
import {
  Td,
  AButton,
  AField,
  AInput,
  ATextarea,
  ASelect,
  fmtDateOnly,
} from '@/app/admins/_components/kit';
import { TableBare } from '@/app/admins/_components/kit';
import { Modal } from '@/app/admins/_components/Modal';
import { ConfirmDelete, type ActionResult } from '@/app/admins/_components/Confirm';
import { useSaveAction } from '@/app/admins/_components/useSaveAction';
import { upsertSetting, deleteSetting } from './actions';

export interface SettingRow {
  id: string;
  group: string;
  key: string;
  value: string | null;
  updatedAt: string;
}

const GROUP_LABEL: Record<string, string> = {
  general: 'عمومی',
  contact: 'ارتباطات',
  social: 'شبکه‌های اجتماعی',
  commerce: 'تجارت و مالی',
  vat_rate: 'مالیات بر ارزش افزوده',
  seo: 'سئو',
};
const GROUP_ORDER = ['general', 'contact', 'social', 'commerce', 'vat_rate', 'seo'];

function groupLabel(g: string) {
  return GROUP_LABEL[g] ?? g;
}

export function SettingsManager({ rows }: { rows: SettingRow[] }) {
  const [editing, setEditing] = useState<SettingRow | null>(null);
  const [addingGroup, setAddingGroup] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<SettingRow | null>(null);

  // Group rows while preserving a sensible order
  const groups = [...new Set(rows.map((r) => r.group))].sort((a, b) => {
    const ia = GROUP_ORDER.indexOf(a);
    const ib = GROUP_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  const knownGroups = groups;

  return (
    <div className="space-y-6 p-5">
      {groups.length === 0 ? (
        <p className="rounded-xl bg-cloud-100/70 px-4 py-6 text-center text-[13px] font-bold text-ink-500">
          تنظیماتی ثبت نشده است؛ با «افزودن کلید» شروع کنید.
        </p>
      ) : (
        groups.map((g) => (
          <GroupSection
            key={g}
            group={g}
            rows={rows.filter((r) => r.group === g)}
            knownGroups={knownGroups}
            onAdd={() => setAddingGroup(g)}
            onEdit={(r) => setEditing(r)}
            onDelete={(r) => setDeleting(r)}
          />
        ))
      )}

      <SettingModal
        open={editing !== null}
        onClose={() => setEditing(null)}
        initial={editing ?? undefined}
        groups={knownGroups}
      />
      <SettingModal
        open={addingGroup !== null}
        onClose={() => setAddingGroup(null)}
        defaultGroup={addingGroup ?? undefined}
        groups={knownGroups}
      />
      <ConfirmDelete
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        label={`کلید «${deleting?.key ?? ''}» حذف شود؟`}
        action={async (): Promise<ActionResult> => deleteSetting(deleting?.id ?? '')}
      />
    </div>
  );
}

function GroupSection({
  group,
  rows,
  onAdd,
  onEdit,
  onDelete,
}: {
  group: string;
  rows: SettingRow[];
  knownGroups: string[];
  onAdd: () => void;
  onEdit: (r: SettingRow) => void;
  onDelete: (r: SettingRow) => void;
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-[13.5px] font-extrabold text-navy-900">
          <KeyRound className="h-4 w-4 text-brand-600" />
          {groupLabel(group)}
          <span className="text-[11.5px] font-bold text-ink-400">
            ({rows.length.toLocaleString('fa-IR')} کلید)
          </span>
        </h3>
        <AButton variant="outline" className="h-8 px-3" onClick={onAdd}>
          <Plus className="h-3.5 w-3.5" /> افزودن کلید
        </AButton>
      </div>

      <TableBare columns={['کلید', 'مقدار', 'آخرین تغییر', 'عملیات']}>
        {rows.map((r) => (
          <tr key={r.id} className="transition-colors hover:bg-cloud-100/60">
            <Td dir="ltr" className="tabular-nums text-[12.5px] font-bold text-navy-900">
              {r.key}
            </Td>
            <Td>
              <span className="block max-w-md truncate text-[13px]" title={r.value ?? ''}>
                {r.value ?? <span className="text-[12px] text-ink-400">خالی</span>}
              </span>
            </Td>
            <Td className="whitespace-nowrap text-[12px] text-ink-500">{fmtDateOnly(r.updatedAt)}</Td>
            <Td>
              <div className="flex items-center gap-1.5">
                <AButton variant="outline" className="h-8 px-2.5" onClick={() => onEdit(r)}>
                  <Pencil className="h-3.5 w-3.5" /> ویرایش
                </AButton>
                <AButton
                  variant="danger"
                  className="h-8 px-2.5 border-0 bg-red-50 text-red-600 hover:bg-red-100"
                  onClick={() => onDelete(r)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </AButton>
              </div>
            </Td>
          </tr>
        ))}
      </TableBare>
    </section>
  );
}

function SettingModal({
  open,
  onClose,
  initial,
  defaultGroup,
  groups,
}: {
  open: boolean;
  onClose: () => void;
  initial?: SettingRow;
  defaultGroup?: string;
  groups: string[];
}) {
  const api = useSaveAction(upsertSetting);
  const s = initial;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={s ? `ویرایش کلید: ${s.key}` : 'افزودن کلید تنظیمات'}
      wide
    >
      <form onSubmit={api.onSubmit} className="space-y-4">
        <input type="hidden" name="id" value={s?.id ?? ''} />
        {api.success ? (
          <p className="text-[12.5px] font-bold text-emerald-700">ذخیره شد.</p>
        ) : null}
        {api.error ? <p className="text-[12.5px] font-bold text-red-600">{api.error}</p> : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AField label="گروه">
            <ASelect
              name="group"
              defaultValue={s?.group ?? defaultGroup ?? 'general'}
            >
              {groups.map((g) => (
                <option key={g} value={g}>
                  {groupLabel(g)}
                </option>
              ))}
              {s && !groups.includes(s.group) ? (
                <option key={s.group} value={s.group}>
                  {groupLabel(s.group)}
                </option>
              ) : null}
            </ASelect>
          </AField>
          <AField label="کلید" required hint="با حروف انگلیسی، عدد، زیرمخطوط (مثلا site_name)">
            <AInput
              name="key"
              dir="ltr"
              className="text-left tabular-nums"
              defaultValue={s?.key ?? ''}
              required
            />
          </AField>
          <AField
            label="مقدار"
            className="sm:col-span-2"
            hint="خالی بگذارید تا مقدار حذف شود"
          >
            <ATextarea
              name="value"
              rows={3}
              dir="auto"
              defaultValue={s?.value ?? ''}
              placeholder="مقدار تنظیمات…"
            />
          </AField>
        </div>

        <div className="flex justify-end gap-2 border-t border-cloud-200 pt-4">
          <AButton variant="outline" type="button" onClick={onClose}>
            بستن
          </AButton>
          <AButton type="submit" disabled={api.pending}>
            {api.pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            {s ? 'ذخیره' : 'افزودن کلید'}
          </AButton>
        </div>
      </form>
    </Modal>
  );
}
