'use client';

import { useState } from 'react';
import { Pencil, Trash2, Plus, LoaderCircle, Receipt, Wallet } from 'lucide-react';
import {
  Td,
  EmptyRow,
  AButton,
  AField,
  AInput,
  ASelect,
  StatusPill,
  formatToman,
  fmtDateOnly,
} from '@/app/admins/_components/kit';
import { TableBare } from '@/app/admins/_components/kit';
import { Modal } from '@/app/admins/_components/Modal';
import { ConfirmDelete, type ActionResult } from '@/app/admins/_components/Confirm';
import { useSaveAction } from '@/app/admins/_components/useSaveAction';
import {
  updateInvoice,
  deleteInvoice,
  upsertInvoiceItem,
  deleteInvoiceItem,
  updateTransaction,
} from './actions';

export interface InvoiceRow {
  id: string;
  number: string;
  userName: string;
  userMobile: string;
  status: string;
  paymentMethod: string | null;
  subtotal: number;
  discountAmount: number;
  couponCode: string | null;
  taxRate: string;
  taxAmount: number;
  total: number;
  billingName: string;
  billingMobile: string;
  billingEmail: string | null;
  billingNationalCode: string | null;
  note: string | null;
  paidAt: string | null;
  createdAt: string;
  items: {
    id: string;
    title: string;
    originalPrice: number | null;
    unitPrice: number;
    quantity: number;
    total: number;
    courseId: string | null;
  }[];
  transactions: {
    id: string;
    type: string;
    gateway: string;
    amount: number;
    status: string;
    authority: string | null;
    referenceId: string | null;
    description: string | null;
    paidAt: string | null;
    createdAt: string;
  }[];
  enrollments: { id: string; courseTitle: string; status: string }[];
  walletTxCount: number;
}
export interface CourseOption {
  id: string;
  title: string;
}

export function InvoicesManager({
  rows,
  courses,
  query,
}: {
  rows: InvoiceRow[];
  courses: CourseOption[];
  query?: string;
}) {
  const [localQuery, setLocalQuery] = useState(query ?? '');
  const [statusFilter, setStatusFilter] = useState('all');
  const [opening, setOpening] = useState<InvoiceRow | null>(null);
  const [deleting, setDeleting] = useState<InvoiceRow | null>(null);

  // Follow the server-side query when it changes (adjust state during render).
  const [prevQuery, setPrevQuery] = useState(query);
  if (prevQuery !== query) {
    setPrevQuery(query);
    setLocalQuery(query ?? '');
  }

  const filtered = rows.filter((r) => {
    const ms = statusFilter === 'all' || r.status === statusFilter;
    const q = localQuery.toLowerCase();
    const mq =
      localQuery === '' ||
      r.number.toLowerCase().includes(q) ||
      r.userName.toLowerCase().includes(q) ||
      r.billingMobile.includes(q) ||
      (r.couponCode ?? '').toLowerCase().includes(q);
    return ms && mq;
  });

  return (
    <div className="space-y-4 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          placeholder="جستجو در شماره، نام یا کوپن…"
          className="h-9 w-56 rounded-lg border border-cloud-300 bg-white px-3 text-[12.5px] outline-none placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-lg border border-cloud-300 bg-white px-3 text-[12.5px] text-navy-900 outline-none focus:border-brand-500"
        >
          <option value="all">همه</option>
          <option value="pending">در انتظار</option>
          <option value="paid">پرداخت شده</option>
          <option value="failed">ناموفق</option>
          <option value="cancelled">لغو شده</option>
          <option value="refunded">استرداد</option>
        </select>
      </div>

      <TableBare columns={['شماره', 'کاربر', 'مبلغ', 'روش', 'کوپن', 'وضعیت', 'تاریخ', 'عملیات']}>
        {filtered.length === 0 ? (
          <EmptyRow colSpan={8} label={localQuery || statusFilter !== 'all' ? 'موردی یافت نشد' : 'فاکتوری ثبت نشده است'} />
        ) : (
          filtered.map((r) => (
            <tr key={r.id} className="transition-colors hover:bg-cloud-100/60">
              <Td><span dir="ltr" className="tabular-nums text-[12.5px] font-bold text-navy-900">{r.number}</span></Td>
              <Td>
                <p className="text-[13px] font-bold text-navy-900">{r.userName}</p>
                <p className="text-[11px] text-ink-400" dir="ltr">{r.userMobile}</p>
              </Td>
              <Td className="whitespace-nowrap font-bold">{formatToman(r.total)}</Td>
              <Td>
                {r.paymentMethod === 'gateway' ? (
                  <span className="inline-flex items-center gap-1 text-[12px] text-ink-500">
                    <Receipt className="h-3.5 w-3.5" /> درگاه
                  </span>
                ) : r.paymentMethod === 'wallet' ? (
                  <span className="inline-flex items-center gap-1 text-[12px] text-ink-500">
                    <Wallet className="h-3.5 w-3.5" /> کیف‌پول
                  </span>
                ) : (
                  <span className="text-[12px] text-ink-400">—</span>
                )}
              </Td>
              <Td className="text-[12px] text-ink-500">{r.couponCode ?? '—'}</Td>
              <Td><StatusPill value={r.status} /></Td>
              <Td className="whitespace-nowrap text-[12px] text-ink-500">{fmtDateOnly(r.createdAt)}</Td>
              <Td>
                <div className="flex items-center gap-1.5">
                  <AButton variant="outline" className="h-8 px-2.5" onClick={() => setOpening(r)}>
                    <Pencil className="h-3.5 w-3.5" /> جزئیات
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

      <InvoiceModal
        open={opening !== null}
        onClose={() => setOpening(null)}
        initial={opening ?? undefined}
        courses={courses}
      />
      <ConfirmDelete
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        label={`فاکتور «${deleting?.number ?? ''}» حذف شود؟`}
        action={async (): Promise<ActionResult> => deleteInvoice(deleting?.id ?? '')}
      />
    </div>
  );
}

/* ───────────────────────── Invoice detail modal ───────────────────────── */

function InvoiceModal({
  open,
  onClose,
  initial,
  courses,
}: {
  open: boolean;
  onClose: () => void;
  initial?: InvoiceRow;
  courses: CourseOption[];
}) {
  const inv = initial;
  const [tab, setTab] = useState<'info' | 'items' | 'tx' | 'enroll'>('info');
  const main = useSaveAction(updateInvoice);

  // Reset to the first tab whenever the modal opens for another record.
  const openKey = open ? (inv?.id ?? 'new') : null;
  const [prevOpenKey, setPrevOpenKey] = useState(openKey);
  if (prevOpenKey !== openKey) {
    setPrevOpenKey(openKey);
    if (open) setTab('info');
  }

  const tabs: [string, string][] = [
    ['info', 'اطلاعات'],
    ['items', `اقلام (${inv?.items.length ?? 0})`],
    ['tx', `تراکنش‌ها (${inv?.transactions.length ?? 0})`],
    ['enroll', `دوره‌ها (${inv?.enrollments.length ?? 0})`],
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={inv ? `فاکتور ${inv.number}` : ''}
      description={inv ? `${inv.userName} · ${inv.userMobile}` : undefined}
      wide
    >
      {inv ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1 rounded-lg bg-cloud-100 p-1">
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

          {tab === 'info' ? (
            <form onSubmit={main.onSubmit} className="space-y-4">
              <input type="hidden" name="id" value={inv.id} />
              {main.error ? <p className="text-[12.5px] font-bold text-red-600">{main.error}</p> : null}

              <div className="grid grid-cols-2 gap-3 rounded-xl bg-cloud-100/70 p-4 text-[12.5px] sm:grid-cols-4">
                <div><p className="text-ink-400">جمع اقلام</p><p className="font-bold text-navy-900">{formatToman(inv.subtotal)}</p></div>
                <div><p className="text-ink-400">تخفیف</p><p className="font-bold text-emerald-700">{formatToman(inv.discountAmount)}</p></div>
                <div><p className="text-ink-400">مالیات ({inv.taxRate}٪)</p><p className="font-bold text-navy-900">{formatToman(inv.taxAmount)}</p></div>
                <div><p className="text-ink-400">مجموع</p><p className="text-[15px] font-black text-navy-900">{formatToman(inv.total)}</p></div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <AField label="وضعیت">
                  <ASelect name="status" defaultValue={inv.status}>
                    <option value="pending">در انتظار پرداخت</option>
                    <option value="paid">پرداخت شده</option>
                    <option value="failed">ناموفق</option>
                    <option value="cancelled">لغو شده</option>
                    <option value="refunded">استرداد شده</option>
                  </ASelect>
                </AField>
                <AField label="یادداشت"><AInput name="note" defaultValue={inv.note ?? ''} /></AField>
                <AField label="نام فرستنده"><AInput name="billingName" defaultValue={inv.billingName} /></AField>
                <AField label="موبایل فرستنده"><AInput name="billingMobile" defaultValue={inv.billingMobile} dir="ltr" className="text-left" /></AField>
                <AField label="ایمیل فرستنده"><AInput name="billingEmail" defaultValue={inv.billingEmail ?? ''} dir="ltr" className="text-left" /></AField>
                <AField label="کد ملی فرستنده"><AInput name="billingNationalCode" defaultValue={inv.billingNationalCode ?? ''} dir="ltr" className="text-left" /></AField>
              </div>

              <div className="flex justify-end gap-2 border-t border-cloud-200 pt-4">
                <AButton variant="outline" type="button" onClick={onClose}>بستن</AButton>
                <AButton type="submit" disabled={main.pending}>
                  {main.pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                  ذخیره
                </AButton>
              </div>
            </form>
          ) : null}

          {tab === 'items' ? (
            <ItemsTab invoice={inv} courses={courses} />
          ) : null}

          {tab === 'tx' ? (
            <TransactionsTab transactions={inv.transactions} />
          ) : null}

          {tab === 'enroll' ? (
            <div className="space-y-2">
              {inv.enrollments.length === 0 ? (
                <p className="rounded-lg bg-cloud-100 px-3 py-3 text-[12.5px] text-ink-500">
                  دوره‌ای با این فاکتور ثبت‌نام نشده است.
                </p>
              ) : (
                inv.enrollments.map((e) => (
                  <div key={e.id} className="flex items-center justify-between rounded-lg border border-cloud-200 px-3 py-2.5">
                    <p className="text-[13px] font-bold text-navy-900">{e.courseTitle}</p>
                    <StatusPill value={e.status} />
                  </div>
                ))
              )}
              {inv.walletTxCount > 0 ? (
                <p className="text-[11.5px] text-ink-400">
                  این فاکتور {inv.walletTxCount.toLocaleString('fa-IR')} تراکنش کیف‌پول دارد.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}

/* ───────────────────────── Items tab ───────────────────────── */

function ItemsTab({
  invoice,
  courses,
}: {
  invoice: InvoiceRow;
  courses: CourseOption[];
}) {
  const [deletingItem, setDeletingItem] = useState<string | null>(null);
  const add = useSaveAction(upsertInvoiceItem);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-dashed border-cloud-400 bg-cloud-100/60 p-4">
        <form onSubmit={add.onSubmit} className="grid grid-cols-2 gap-3">
          <input type="hidden" name="invoiceId" value={invoice.id} />
          <AField label="عنوان کالا" className="col-span-2">
            <AInput name="title" required placeholder="مثلا: دوره حسابداری مقدماتی" />
          </AField>
          <AField label="دوره">
            <ASelect name="courseId">
              <option value="">— بدون دوره —</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </ASelect>
          </AField>
          <AField label="قیمت واحد (تومان)">
            <AInput name="unitPrice" type="number" min={0} required dir="ltr" className="text-left" />
          </AField>
          <AField label="قیمت اصلی">
            <AInput name="originalPrice" type="number" min={0} dir="ltr" className="text-left" />
          </AField>
          <AField label="تعداد">
            <AInput name="quantity" type="number" min={1} defaultValue="1" dir="ltr" className="text-left" />
          </AField>
          {add.error ? <p className="col-span-2 -mt-1 text-[12px] text-red-600">{add.error}</p> : null}
          <div className="col-span-2 flex justify-end">
            <AButton type="submit" disabled={add.pending}>
              {add.pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              افزودن قلم
            </AButton>
          </div>
        </form>
      </div>

      {invoice.items.length === 0 ? (
        <p className="text-[12.5px] text-ink-500">قلمی ندارد.</p>
      ) : (
        <div className="divide-y divide-cloud-200/80 rounded-xl border border-cloud-200">
          {invoice.items.map((it) => (
            <ItemRow
              key={it.id}
              item={it}
              onRemove={() => setDeletingItem(it.id)}
            />
          ))}
        </div>
      )}

      <ConfirmDelete
        open={deletingItem !== null}
        onClose={() => setDeletingItem(null)}
        label="این قلم از فاکتور حذف شود؟"
        action={async (): Promise<ActionResult> => deleteInvoiceItem(deletingItem ?? '')}
      />
    </div>
  );
}

function ItemRow({
  item,
  onRemove,
}: {
  item: InvoiceRow['items'][number];
  onRemove: () => void;
}) {
  const api = useSaveAction(upsertInvoiceItem);
  const invoiceId = item.courseId; // not used directly; passed via hidden in add form
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5">
      <div className="min-w-0">
        <p className="text-[13px] font-bold text-navy-900">{item.title}</p>
        <p className="text-[11.5px] text-ink-400">
          {item.quantity.toLocaleString('fa-IR')} × {formatToman(item.unitPrice)}
          {item.originalPrice ? ` (اصلی ${formatToman(item.originalPrice)})` : ''}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="whitespace-nowrap text-[13px] font-black text-navy-900">{formatToman(item.total)}</span>
        <AButton
          variant="danger"
          type="button"
          className="h-8 px-2.5 border-0 bg-red-50 text-red-600 hover:bg-red-100"
          onClick={onRemove}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </AButton>
      </div>
      {/* Hidden edit form for this item */}
      <form onSubmit={api.onSubmit} className="hidden">
        <input type="hidden" name="id" value={item.id} />
        <input type="hidden" name="invoiceId" value={invoiceId ?? ''} />
        <input type="hidden" name="title" value={item.title} />
        <input type="hidden" name="unitPrice" value={String(item.unitPrice)} />
        <input type="hidden" name="quantity" value={String(item.quantity)} />
        {api.error ? <p className="text-[12px] text-red-600">{api.error}</p> : null}
      </form>
    </div>
  );
}

/* ───────────────────────── Transactions tab ───────────────────────── */

function TransactionsTab({ transactions }: { transactions: InvoiceRow['transactions'] }) {
  if (transactions.length === 0) {
    return (
      <p className="rounded-lg bg-cloud-100 px-3 py-3 text-[12.5px] text-ink-500">
        تراکنشی برای این فاکتور ثبت نشده است.
      </p>
    );
  }
  return (
    <div className="space-y-2">
      {transactions.map((t) => (
        <TxRow key={t.id} tx={t} />
      ))}
    </div>
  );
}

function TxRow({ tx }: { tx: InvoiceRow['transactions'][number] }) {
  const api = useSaveAction(updateTransaction);
  return (
    <form onSubmit={api.onSubmit} className="space-y-3 rounded-xl border border-cloud-200 p-4">
      <input type="hidden" name="id" value={tx.id} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[13px] font-bold text-navy-900" dir="ltr">{tx.gateway}</p>
          <p className="text-[11.5px] text-ink-400">
            {fmtDateOnly(tx.createdAt)}
            {tx.authority ? ` · ${tx.authority}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-black text-navy-900">{formatToman(tx.amount)}</span>
          <StatusPill value={tx.status} />
        </div>
      </div>
      {api.error ? <p className="text-[12px] text-red-600">{api.error}</p> : null}
      <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-3">
        <AField label="وضعیت">
          <ASelect name="status" defaultValue={tx.status}>
            <option value="pending">در انتظار</option>
            <option value="success">موفق</option>
            <option value="failed">ناموفق</option>
            <option value="cancelled">لغو شده</option>
            <option value="refunded">استرداد</option>
          </ASelect>
        </AField>
        <AField label="شماره تراکنش">
          <AInput name="authority" defaultValue={tx.authority ?? ''} dir="ltr" className="text-left" />
        </AField>
        <div className="flex justify-end">
          <AButton type="submit" variant="outline" disabled={api.pending}>
            {api.pending ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : null} ذخیره
          </AButton>
        </div>
      </div>
    </form>
  );
}
