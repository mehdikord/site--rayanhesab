'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, LoaderCircle } from 'lucide-react';
import {
  TableCard,
  Td,
  StatusPill,
  EmptyRow,
  AButton,
  Notice,
  AField,
  AInput,
  ATextarea,
  ASelect,
  ACheckbox,
  fmtDateOnly,
} from '@/app/admins/_components/kit';
import { ImageField } from '@/app/admins/_components/ImageField';
import { Modal } from '@/app/admins/_components/Modal';
import { ConfirmDelete, type ActionResult } from '@/app/admins/_components/Confirm';
import { RowShell } from '@/app/admins/_components/RowEditor';
import { useSaveAction } from '@/app/admins/_components/useSaveAction';
import {
  upsertService,
  deleteService,
  upsertServiceFeature,
  deleteServiceFeature,
  upsertServiceFaq,
  deleteServiceFaq,
  upsertServiceStep,
  deleteServiceStep,
  saveServiceRelated,
} from './actions';

export interface ServiceRow {
  id: string;
  title: string;
  slug: string;
  shortTitle: string | null;
  excerpt: string | null;
  icon: string | null;
  image: string | null;
  accent: string | null;
  sortOrder: number;
  isActive: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  consultationCount: number;
  createdAt: string;
  features: { id: string; type: string; title: string; description: string | null; sortOrder: number }[];
  faqs: { id: string; question: string; answer: string; sortOrder: number }[];
  steps: { id: string; title: string; description: string | null; sortOrder: number }[];
  related: string[];
}

export interface ServiceOption {
  id: string;
  title: string;
}

const FEATURE_TYPE_LABEL: Record<string, string> = {
  problem: 'چالش مشتری',
  scope: 'دامنه کار',
  benefit: 'مزیت',
  audience: 'مخاطب',
};

export function ServicesManager({
  rows,
  options,
}: {
  rows: ServiceRow[];
  options: ServiceOption[];
}) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [editing, setEditing] = useState<ServiceRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<ServiceRow | null>(null);

  const filtered = rows.filter((r) => {
    const matchQuery =
      query === '' ||
      r.title.toLowerCase().includes(query.toLowerCase()) ||
      r.slug.toLowerCase().includes(query.toLowerCase());
    const matchStatus = status === 'all' || (status === 'active' ? r.isActive : !r.isActive);
    return matchQuery && matchStatus;
  });

  return (
    <div className="space-y-4 p-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو در عنوان یا slug…"
            className="h-9 w-52 rounded-lg border border-cloud-300 bg-white px-3 text-[12.5px] outline-none placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
          />
          <div className="flex rounded-lg border border-cloud-300 bg-white p-0.5">
            {(['all', 'active', 'inactive'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={
                  'rounded-md px-3 py-1.5 text-[12px] font-bold transition-colors ' +
                  (status === s ? 'bg-navy-900 text-white' : 'text-ink-500 hover:text-navy-900')
                }
              >
                {s === 'all' ? 'همه' : s === 'active' ? 'فعال' : 'غیرفعال'}
              </button>
            ))}
          </div>
        </div>
        <AButton onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> افزودن خدمت
        </AButton>
      </div>

      {/* Table */}
      <TableCard columns={['خدمت', 'ترتیب', 'درخواست', 'وضعیت', 'تاریخ ایجاد', 'عملیات']}>
        {filtered.length === 0 ? (
          <EmptyRow colSpan={6} label={query ? 'موردی با این فیلتر یافت نشد' : 'هنوز خدمتی ثبت نشده است'} />
        ) : (
          filtered.map((r) => (
            <tr key={r.id} className="transition-colors hover:bg-cloud-100/60">
              <Td>
                <p className="font-extrabold text-navy-900">{r.title}</p>
                <p className="text-[11.5px] text-ink-400" dir="ltr">{`/services/${r.slug}`}</p>
              </Td>
              <Td>{r.sortOrder.toLocaleString('fa-IR')}</Td>
              <Td>{r.consultationCount.toLocaleString('fa-IR')}</Td>
              <Td>
                <StatusPill value={r.isActive ? 'active' : 'archived'} />
              </Td>
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

      {/* Modals */}
      <ServiceModal open={creating} onClose={() => setCreating(false)} options={options} />
      <ServiceModal
        open={editing !== null}
        onClose={() => setEditing(null)}
        initial={editing ?? undefined}
        options={options}
      />
      <ConfirmDelete
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        label={`«${deleting?.title ?? ''}» و همه آیتم‌های وابسته (ویژگی‌ها، FAQ، مراحل) حذف شوند؟`}
        action={async (): Promise<ActionResult> => deleteService(deleting?.id ?? '')}
      />
    </div>
  );
}

/* ───────────────────────── Main modal ───────────────────────── */

function ServiceModal({
  open,
  onClose,
  initial,
  options,
}: {
  open: boolean;
  onClose: () => void;
  initial?: ServiceRow;
  options: ServiceOption[];
}) {
  const svc = initial;
  const [tab, setTab] = useState<'main' | 'features' | 'faqs' | 'steps' | 'related'>('main');
  const main = useSaveAction(upsertService);

  // Reset to the first tab whenever the modal opens for another record.
  const openKey = open ? (svc?.id ?? 'new') : null;
  const [prevOpenKey, setPrevOpenKey] = useState(openKey);
  if (prevOpenKey !== openKey) {
    setPrevOpenKey(openKey);
    if (open) setTab('main');
  }

  // After creating a new service, close so the admin can open the nested tabs from the row.
  useEffect(() => {
    if (main.success && !svc) onClose();
  }, [main.success, svc, onClose]);

  const relatedOpts = options.filter((o) => o.id !== svc?.id);
  const relatedChecked = new Set(svc?.related ?? []);

  const tabs: [string, string][] = [
    ['main', 'اطلاعات'],
    ['features', `ویژگی‌ها (${svc?.features.length ?? 0})`],
    ['faqs', `پرسش‌ها (${svc?.faqs.length ?? 0})`],
    ['steps', `مراحل (${svc?.steps.length ?? 0})`],
    ['related', 'خدمات مرتبط'],
  ];

  return (
    <Modal open={open} onClose={onClose} title={svc ? 'ویرایش خدمت' : 'افزودن خدمت'} wide>
      <div className="mb-4 flex flex-wrap gap-1 rounded-lg bg-cloud-100 p-1">
        {tabs.map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k as typeof tab)}
            className={
              'rounded-md px-3 py-1.5 text-[12px] font-bold transition-colors ' +
              (tab === k ? 'bg-white text-navy-900 shadow-card' : 'text-ink-500 hover:text-navy-900')
            }
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'main' ? (
        <form onSubmit={main.onSubmit} className="space-y-4">
          <input type="hidden" name="id" value={svc?.id ?? ''} />
          {main.error ? <Notice tone="error">{main.error}</Notice> : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AField label="عنوان" required>
              <AInput name="title" defaultValue={svc?.title} required />
            </AField>
            <AField label="Slug" required hint="با خط تیره؛ مثل tax-services">
              <AInput name="slug" defaultValue={svc?.slug} dir="ltr" required className="text-left" />
            </AField>
            <AField label="عنوان کوتاه" className="sm:col-span-2">
              <AInput name="shortTitle" defaultValue={svc?.shortTitle ?? ''} />
            </AField>
            <AField label="توضیح کوتاه" className="sm:col-span-2">
              <ATextarea name="excerpt" rows={2} defaultValue={svc?.excerpt ?? ''} />
            </AField>
            <AField label="آیکون" hint="نام آیکون (lucide) یا ایموجی">
              <AInput name="icon" defaultValue={svc?.icon ?? ''} dir="ltr" className="text-left" />
            </AField>
            <AField label="تصویر" hint="JPG، PNG یا WebP — حداکثر ۵ مگابایت">
              <ImageField name="image" defaultValue={svc?.image} folder="services" />
            </AField>
            <AField label="رنگ تأکید" hint="مثلا #3570cc">
              <AInput name="accent" defaultValue={svc?.accent ?? ''} dir="ltr" className="text-left" />
            </AField>
            <AField label="ترتیب نمایش">
              <AInput name="sortOrder" type="number" min={0} defaultValue={String(svc?.sortOrder ?? 0)} dir="ltr" className="text-left" />
            </AField>
            <AField label="SEO – عنوان" className="sm:col-span-2">
              <AInput name="metaTitle" defaultValue={svc?.metaTitle ?? ''} />
            </AField>
            <AField label="SEO – توضیح" className="sm:col-span-2">
              <ATextarea name="metaDescription" rows={2} defaultValue={svc?.metaDescription ?? ''} />
            </AField>
            <div className="sm:col-span-2">
              <ACheckbox name="isActive" defaultChecked={svc ? svc.isActive : true} label="فعال و قابل نمایش در سایت" />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-cloud-200 pt-4">
            <AButton variant="outline" type="button" onClick={onClose}>
              انصراف
            </AButton>
            <AButton type="submit" disabled={main.pending}>
              {main.pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              {svc ? 'ذخیره تغییرات' : 'ایجاد خدمت'}
            </AButton>
          </div>
        </form>
      ) : null}

      {tab === 'features' && svc ? (
        <div className="space-y-3">
          <SectionLabel label="چالش‌ها، دامنه کار، مزیت‌ها و مخاطبان" count={svc.features.length} />
          <AddCard>
            <FeatureAddForm serviceId={svc.id} key={`add-${svc.features.length}`} />
          </AddCard>
          {svc.features.map((f) => (
            <FeatureRow key={f.id} serviceId={svc.id} row={f} />
          ))}
        </div>
      ) : null}

      {tab === 'faqs' && svc ? (
        <div className="space-y-3">
          <SectionLabel label="پرسش‌های پرتکرار مشتری" count={svc.faqs.length} />
          <AddCard>
            <FaqAddForm serviceId={svc.id} key={`add-${svc.faqs.length}`} />
          </AddCard>
          {svc.faqs.map((f) => (
            <FaqRow key={f.id} serviceId={svc.id} row={f} />
          ))}
        </div>
      ) : null}

      {tab === 'steps' && svc ? (
        <div className="space-y-3">
          <SectionLabel label="مراحل فرایند ارائه خدمت" count={svc.steps.length} />
          <AddCard>
            <StepAddForm serviceId={svc.id} key={`add-${svc.steps.length}`} />
          </AddCard>
          {svc.steps.map((s) => (
            <StepRow key={s.id} serviceId={svc.id} row={s} />
          ))}
        </div>
      ) : null}

      {tab === 'related' && svc ? (
        <RelatedEditor serviceId={svc.id} options={relatedOpts} checked={relatedChecked} />
      ) : null}

      {tab !== 'main' && !svc ? (
        <p className="rounded-lg bg-cloud-100 px-3 py-3 text-[12.5px] text-ink-500">
          این بخش پس از ذخیرهٔ اولیهٔ خدمت در دسترس است.
        </p>
      ) : null}
    </Modal>
  );
}

function SectionLabel({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-[12px] font-bold text-ink-500">{label}</p>
      <span className="text-[11.5px] text-ink-400">{count.toLocaleString('fa-IR')} مورد</span>
    </div>
  );
}

function AddCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-cloud-400 bg-cloud-100/60 p-4">{children}</div>
  );
}

function RowSaveButton({ pending, label }: { pending: boolean; label?: string }) {
  return (
    <AButton type="submit" variant="outline" className="h-8 px-3" disabled={pending}>
      {pending ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : null}
      {label ?? 'ذخیره'}
    </AButton>
  );
}

/* ── Feature rows ── */

function FeatureAddForm({ serviceId }: { serviceId: string }) {
  const api = useSaveAction(upsertServiceFeature);
  return (
    <form onSubmit={api.onSubmit} className="grid grid-cols-2 gap-3">
      <input type="hidden" name="serviceId" value={serviceId} />
      <AField label="نوع">
        <ASelect name="type" defaultValue="problem">
          <option value="problem">چالش مشتری</option>
          <option value="scope">دامنه کار</option>
          <option value="benefit">مزیت</option>
          <option value="audience">مخاطب</option>
        </ASelect>
      </AField>
      <AField label="عنوان" required>
        <AInput name="title" required placeholder="مثلا بیلینگ دقیق" />
      </AField>
      <AField label="توضیح" className="col-span-2">
        <AInput name="description" placeholder="اختیاری" />
      </AField>
      {api.error ? <p className="col-span-2 -mt-1 text-[12px] text-red-600">{api.error}</p> : null}
      <div className="col-span-2 flex justify-end">
        <RowSaveButton pending={api.pending} label="افزودن ویژگی" />
      </div>
    </form>
  );
}

function FeatureRow({ serviceId, row }: { serviceId: string; row: ServiceRow['features'][number] }) {
  const api = useSaveAction(upsertServiceFeature);
  return (
    <RowShell
      title={`${FEATURE_TYPE_LABEL[row.type] ?? row.type}: ${row.title}`}
      subtitle={row.description ?? undefined}
      onRemove={() => deleteServiceFeature(row.id)}
    >
      <form onSubmit={api.onSubmit} className="grid grid-cols-2 gap-3">
        <input type="hidden" name="id" value={row.id} />
        <input type="hidden" name="serviceId" value={serviceId} />
        <AField label="نوع">
          <ASelect name="type" defaultValue={row.type}>
            <option value="problem">چالش مشتری</option>
            <option value="scope">دامنه کار</option>
            <option value="benefit">مزیت</option>
            <option value="audience">مخاطب</option>
          </ASelect>
        </AField>
        <AField label="عنوان">
          <AInput name="title" defaultValue={row.title} />
        </AField>
        <AField label="توضیح" className="col-span-2">
          <AInput name="description" defaultValue={row.description ?? ''} />
        </AField>
        <AField label="ترتیب">
          <AInput name="sortOrder" type="number" defaultValue={String(row.sortOrder)} dir="ltr" className="text-left" />
        </AField>
        {api.error ? <p className="col-span-2 -mt-1 text-[12px] text-red-600">{api.error}</p> : null}
        <div className="col-span-2 flex justify-end">
          <RowSaveButton pending={api.pending} />
        </div>
      </form>
    </RowShell>
  );
}

/* ── FAQ rows ── */

function FaqAddForm({ serviceId }: { serviceId: string }) {
  const api = useSaveAction(upsertServiceFaq);
  return (
    <form onSubmit={api.onSubmit} className="grid grid-cols-1 gap-3">
      <input type="hidden" name="serviceId" value={serviceId} />
      <AField label="سؤال" required>
        <AInput name="question" required />
      </AField>
      <AField label="پاسخ" required>
        <ATextarea name="answer" rows={2} required />
      </AField>
      {api.error ? <p className="-mt-1 text-[12px] text-red-600">{api.error}</p> : null}
      <div className="flex justify-end">
        <RowSaveButton pending={api.pending} label="افزودن پرسش" />
      </div>
    </form>
  );
}

function FaqRow({ serviceId, row }: { serviceId: string; row: ServiceRow['faqs'][number] }) {
  const api = useSaveAction(upsertServiceFaq);
  return (
    <RowShell title={row.question} onRemove={() => deleteServiceFaq(row.id)}>
      <form onSubmit={api.onSubmit} className="grid grid-cols-1 gap-3">
        <input type="hidden" name="id" value={row.id} />
        <input type="hidden" name="serviceId" value={serviceId} />
        <AField label="سؤال">
          <AInput name="question" defaultValue={row.question} />
        </AField>
        <AField label="پاسخ">
          <ATextarea name="answer" rows={2} defaultValue={row.answer} />
        </AField>
        <AField label="ترتیب">
          <AInput name="sortOrder" type="number" defaultValue={String(row.sortOrder)} dir="ltr" className="text-left" />
        </AField>
        {api.error ? <p className="-mt-1 text-[12px] text-red-600">{api.error}</p> : null}
        <div className="flex justify-end">
          <RowSaveButton pending={api.pending} />
        </div>
      </form>
    </RowShell>
  );
}

/* ── Step rows ── */

function StepAddForm({ serviceId }: { serviceId: string }) {
  const api = useSaveAction(upsertServiceStep);
  return (
    <form onSubmit={api.onSubmit} className="grid grid-cols-2 gap-3">
      <input type="hidden" name="serviceId" value={serviceId} />
      <AField label="عنوان مرحله" required>
        <AInput name="title" required />
      </AField>
      <AField label="توضیح">
        <AInput name="description" />
      </AField>
      {api.error ? <p className="col-span-2 -mt-1 text-[12px] text-red-600">{api.error}</p> : null}
      <div className="col-span-2 flex justify-end">
        <RowSaveButton pending={api.pending} label="افزودن مرحله" />
      </div>
    </form>
  );
}

function StepRow({ serviceId, row }: { serviceId: string; row: ServiceRow['steps'][number] }) {
  const api = useSaveAction(upsertServiceStep);
  return (
    <RowShell title={row.title} subtitle={row.description ?? undefined} onRemove={() => deleteServiceStep(row.id)}>
      <form onSubmit={api.onSubmit} className="grid grid-cols-2 gap-3">
        <input type="hidden" name="id" value={row.id} />
        <input type="hidden" name="serviceId" value={serviceId} />
        <AField label="عنوان مرحله">
          <AInput name="title" defaultValue={row.title} />
        </AField>
        <AField label="توضیح">
          <AInput name="description" defaultValue={row.description ?? ''} />
        </AField>
        <AField label="ترتیب">
          <AInput name="sortOrder" type="number" defaultValue={String(row.sortOrder)} dir="ltr" className="text-left" />
        </AField>
        {api.error ? <p className="col-span-2 -mt-1 text-[12px] text-red-600">{api.error}</p> : null}
        <div className="col-span-2 flex justify-end">
          <RowSaveButton pending={api.pending} />
        </div>
      </form>
    </RowShell>
  );
}

/* ── Related editor ── */

function RelatedEditor({
  serviceId,
  options,
  checked,
}: {
  serviceId: string;
  options: ServiceOption[];
  checked: Set<string>;
}) {
  const api = useSaveAction(saveServiceRelated);
  return (
    <form onSubmit={api.onSubmit} className="space-y-4">
      <input type="hidden" name="serviceId" value={serviceId} />
      {api.success ? <Notice tone="success">ذخیره شد.</Notice> : null}
      {api.error ? <Notice tone="error">{api.error}</Notice> : null}

      {options.length === 0 ? (
        <p className="text-[13px] text-ink-500">خدمت دیگری برای ارتباط وجود ندارد.</p>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {options.map((o) => {
            const isChecked = checked.has(o.id);
            return (
              <label
                key={o.id}
                className={
                  'flex items-center gap-2.5 rounded-lg border px-3 py-2.5 transition-colors ' +
                  (isChecked ? 'border-brand-400 bg-brand-50/60' : 'border-cloud-300 bg-white hover:bg-cloud-100')
                }
              >
                <input type="hidden" name={`related:${o.id}`} value="0" />
                <ACheckbox name={`related:${o.id}`} defaultChecked={isChecked} />
                <span className="text-[13px] font-semibold text-navy-900">{o.title}</span>
              </label>
            );
          })}
        </div>
      )}

      <div className="flex justify-end">
        <AButton type="submit" disabled={api.pending}>
          {api.pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          ذخیره خدمات مرتبط
        </AButton>
      </div>
    </form>
  );
}
