'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, LoaderCircle, Wallet, BookOpen } from 'lucide-react';
import {
  Td,
  EmptyRow,
  AButton,
  AField,
  AInput,
  ATextarea,
  ASelect,
  ACheckbox,
  StatusPill,
  formatToman,
  fmtDateOnly,
} from '@/app/admins/_components/kit';
import { ImageField } from '@/app/admins/_components/ImageField';
import { TableBare } from '@/app/admins/_components/kit';
import { Modal } from '@/app/admins/_components/Modal';
import { ConfirmDelete, type ActionResult } from '@/app/admins/_components/Confirm';
import { useSaveAction } from '@/app/admins/_components/useSaveAction';
import {
  upsertUser,
  deleteUser,
  adjustWallet,
  grantEnrollment,
  updateEnrollment,
  deleteEnrollment,
} from './actions';

export interface WalletTxRow {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  description: string | null;
  adminName: string | null;
  createdAt: string;
}
export interface CourseOption {
  id: string;
  title: string;
}
export interface UserRow {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
  bio: string | null;
  avatar: string | null;
  isActive: boolean;
  hasPassword: boolean;
  mobileVerifiedAt: string | null;
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  walletBalance: number;
  invoiceCount: number;
  transactionCount: number;
  enrollments: {
    id: string;
    courseTitle: string;
    status: string;
    expiresAt: string | null;
    createdAt: string;
  }[];
  walletTransactions: WalletTxRow[];
}

export function UsersManager({
  rows,
  courses,
  query,
}: {
  rows: UserRow[];
  courses: CourseOption[];
  query?: string;
}) {
  const [localQuery, setLocalQuery] = useState(query ?? '');
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<UserRow | null>(null);

  // Follow the server-side query when it changes (adjust state during render).
  const [prevQuery, setPrevQuery] = useState(query);
  if (prevQuery !== query) {
    setPrevQuery(query);
    setLocalQuery(query ?? '');
  }

  const filtered = rows.filter((r) => {
    if (localQuery === '') return true;
    const q = localQuery.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.mobile.includes(q) ||
      (r.email ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          placeholder="جستجو در نام، موبایل یا ایمیل…"
          className="h-9 w-60 rounded-lg border border-cloud-300 bg-white px-3 text-[12.5px] outline-none placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
        />
        <AButton onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> افزودن کاربر
        </AButton>
      </div>

      <TableBare columns={['کاربر', 'موبایل', 'کیف‌پول', 'ثبت‌نام', 'فاکتور', 'ورود آخر', 'عملیات']}>
        {filtered.length === 0 ? (
          <EmptyRow colSpan={7} label={localQuery ? 'موردی یافت نشد' : 'کاربری ثبت نشده است'} />
        ) : (
          filtered.map((r) => (
            <tr key={r.id} className="transition-colors hover:bg-cloud-100/60">
              <Td>
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-[13px] font-black text-brand-700">
                    {r.name.trim().charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-extrabold text-navy-900">{r.name}</p>
                    <p className="truncate text-[11.5px] text-ink-400" dir="ltr">{r.email ?? '—'}</p>
                  </div>
                </div>
              </Td>
              <Td><span dir="ltr" className="text-[12.5px]">{r.mobile}</span></Td>
              <Td className="whitespace-nowrap">
                <span className="font-bold text-navy-900">{formatToman(r.walletBalance)}</span>
              </Td>
              <Td>{r.enrollments.length.toLocaleString('fa-IR')}</Td>
              <Td>{r.invoiceCount.toLocaleString('fa-IR')}</Td>
              <Td className="whitespace-nowrap text-[12px] text-ink-500">
                {r.lastLoginAt ? fmtDateOnly(r.lastLoginAt) : '—'}
              </Td>
              <Td>
                <div className="flex items-center gap-1.5">
                  <StatusPill value={r.isActive ? 'active' : 'archived'} />
                  <AButton variant="outline" className="h-8 px-2.5" onClick={() => setEditing(r)}>
                    <Pencil className="h-3.5 w-3.5" />
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

      <UserModal open={creating} onClose={() => setCreating(false)} courses={courses} />
      <UserModal
        open={editing !== null}
        onClose={() => setEditing(null)}
        initial={editing ?? undefined}
        courses={courses}
      />
      <ConfirmDelete
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        label={`کاربر «${deleting?.name ?? ''}» و همه رکورد وابسته (کیف‌پول، ثبت‌نام‌ها) حذف شود؟`}
        action={async (): Promise<ActionResult> => deleteUser(deleting?.id ?? '')}
      />
    </div>
  );
}

/* ───────────────────────── User modal ───────────────────────── */

function UserModal({
  open,
  onClose,
  initial,
  courses,
}: {
  open: boolean;
  onClose: () => void;
  initial?: UserRow;
  courses: CourseOption[];
}) {
  const u = initial;
  const [tab, setTab] = useState<'main' | 'wallet' | 'enroll' | 'activity'>('main');
  const main = useSaveAction(upsertUser);

  // Reset to the first tab whenever the modal opens for another record.
  const openKey = open ? (u?.id ?? 'new') : null;
  const [prevOpenKey, setPrevOpenKey] = useState(openKey);
  if (prevOpenKey !== openKey) {
    setPrevOpenKey(openKey);
    if (open) setTab('main');
  }

  const tabs: [string, string][] = [
    ['main', 'اطلاعات'],
    ['wallet', 'کیف‌پول'],
    ['enroll', `ثبت‌نام‌ها (${u?.enrollments.length ?? 0})`],
    ['activity', 'فعالیت'],
  ];

  return (
    <Modal open={open} onClose={onClose} title={u ? `کاربر: ${u.name}` : 'افزودن کاربر'} wide>
      <div className="mb-4 flex flex-wrap gap-1 rounded-lg bg-cloud-100 p-1">
        {tabs.map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k as typeof tab)}
            disabled={k !== 'main' && !u}
            className={
              'rounded-md px-3 py-1.5 text-[12px] font-bold transition-colors disabled:opacity-50 ' +
              (tab === k ? 'bg-white text-navy-900 shadow-card' : 'text-ink-500 hover:text-navy-900')
            }
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'main' ? (
        <form onSubmit={main.onSubmit} className="space-y-4">
          <input type="hidden" name="id" value={u?.id ?? ''} />
          {main.error ? <p className="text-[12.5px] font-bold text-red-600">{main.error}</p> : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AField label="نام و نام خانوادگی" required>
              <AInput name="name" defaultValue={u?.name} required />
            </AField>
            <AField label="موبایل" required>
              <AInput name="mobile" defaultValue={u?.mobile} dir="ltr" required className="text-left" />
            </AField>
            <AField label="ایمیل">
              <AInput name="email" defaultValue={u?.email ?? ''} dir="ltr" className="text-left" />
            </AField>
            <AField label="تصویر پروفایل">
              <ImageField name="avatar" defaultValue={u?.avatar} folder="users" />
            </AField>
            <AField label="بیوگرافی" className="sm:col-span-2">
              <ATextarea name="bio" rows={2} defaultValue={u?.bio ?? ''} />
            </AField>
            <AField
              label={u ? 'تغییر رمز عبور' : 'رمز عبور'}
              hint={u ? 'خالی بگذارید تا رمز فعلی حفظ شود' : 'اختیاری — حداقل ۸ کاراکتر'}
            >
              <AInput name="password" type="password" dir="ltr" className="text-left" autoComplete="new-password" />
            </AField>
            <div>
              <ACheckbox name="isActive" defaultChecked={u ? u.isActive : true} label="فعال" />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-cloud-200 pt-4">
            <AButton variant="outline" type="button" onClick={onClose}>انصراف</AButton>
            <AButton type="submit" disabled={main.pending}>
              {main.pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              {u ? 'ذخیره تغییرات' : 'ایجاد کاربر'}
            </AButton>
          </div>
        </form>
      ) : null}

      {tab === 'wallet' && u ? (
        <WalletTab user={u} />
      ) : null}

      {tab === 'enroll' && u ? (
        <EnrollTab user={u} courses={courses} />
      ) : null}

      {tab === 'activity' && u ? (
        <ActivityTab user={u} />
      ) : null}

      {tab !== 'main' && !u ? (
        <p className="rounded-lg bg-cloud-100 px-3 py-3 text-[12.5px] text-ink-500">
          این بخش پس از ذخیرهٔ اولیهٔ کاربر در دسترس است.
        </p>
      ) : null}
    </Modal>
  );
}

/* ───────────────────────── Wallet tab ───────────────────────── */

function WalletTab({ user }: { user: UserRow }) {
  const api = useSaveAction(adjustWallet);
  const [type, setType] = useState<'deposit' | 'withdraw'>('deposit');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl bg-cloud-100/70 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600">
            <Wallet className="h-4.5 w-4.5" />
          </span>
          <div>
            <p className="text-[11.5px] font-bold text-ink-500">موجودی فعلی</p>
            <p className="text-[17px] font-black text-navy-900">{formatToman(user.walletBalance)}</p>
          </div>
        </div>
        <AButton variant="outline" onClick={() => setType(type === 'deposit' ? 'withdraw' : 'deposit')}>
          {type === 'deposit' ? 'برداشت' : 'واریز'}
        </AButton>
      </div>

      <form onSubmit={api.onSubmit} className="space-y-3 rounded-xl border border-cloud-300 p-4">
        <input type="hidden" name="userId" value={user.id} />
        <input type="hidden" name="type" value={type} />
        {api.success ? <p className="text-[12.5px] font-bold text-emerald-700">{api.success ? 'ذخیره شد.' : ''}</p> : null}
        {api.error ? <p className="text-[12.5px] font-bold text-red-600">{api.error}</p> : null}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <AField label={`مبلغ ${type === 'deposit' ? 'واریز' : 'برداشت'} (تومان)`}>
            <AInput name="amount" type="number" min={1} required dir="ltr" className="text-left" />
          </AField>
          <AField label="توضیح" className="sm:col-span-2">
            <AInput name="description" placeholder="مثلا: بازپرداخت سرویس، جبران تخفیف…" />
          </AField>
        </div>
        <div className="flex justify-end">
          <AButton type="submit" disabled={api.pending}>
            {api.pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            {type === 'deposit' ? 'واریز به کیف‌پول' : 'برداشت از کیف‌پول'}
          </AButton>
        </div>
      </form>

      {user.walletTransactions.length > 0 ? (
        <div>
          <p className="mb-2 text-[12px] font-bold text-ink-500">آخرین تراکنش‌های کیف‌پول</p>
          <div className="divide-y divide-cloud-200/80 rounded-xl border border-cloud-200">
            {user.walletTransactions.slice(0, 8).map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="flex items-center gap-2.5">
                  <StatusPill value={t.type} />
                  <span className="text-[12.5px] text-ink-500">{t.description ?? '—'}</span>
                </div>
                <div className="text-left">
                  <p className="text-[13px] font-bold text-navy-900" dir="ltr">
                    {formatToman(t.amount)}
                  </p>
                  <p className="text-[10.5px] text-ink-400">
                    {fmtDateOnly(t.createdAt)}
                    {t.adminName ? ` · ${t.adminName}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ───────────────────────── Enrollments tab ───────────────────────── */

function EnrollTab({ user, courses }: { user: UserRow; courses: CourseOption[] }) {
  const grant = useSaveAction(grantEnrollment);
  const [deletingEnroll, setDeletingEnroll] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-dashed border-cloud-400 bg-cloud-100/60 p-4">
        <form onSubmit={grant.onSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input type="hidden" name="userId" value={user.id} />
          {grant.success ? <p className="col-span-full text-[12.5px] font-bold text-emerald-700">ذخیره شد.</p> : null}
          {grant.error ? <p className="col-span-full text-[12.5px] font-bold text-red-600">{grant.error}</p> : null}
          <AField label="دوره">
            <ASelect name="courseId">
              <option value="">— انتخاب دوره —</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </ASelect>
          </AField>
          <AField label="تاریخ انقضا">
            <AInput name="expiresAt" type="date" dir="ltr" className="text-left" />
          </AField>
          <div className="flex items-end">
            <AButton type="submit" disabled={grant.pending} className="w-full sm:w-auto">
              {grant.pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              ثبت‌نام دستی
            </AButton>
          </div>
        </form>
      </div>

      {user.enrollments.length > 0 ? (
        <div className="space-y-2">
          {user.enrollments.map((e) => (
            <EnrollRow key={e.id} enrollment={e} onDelete={() => setDeletingEnroll(e.id)} />
          ))}
        </div>
      ) : (
        <p className="rounded-lg bg-cloud-100 px-3 py-2.5 text-[12px] text-ink-500">ثبت‌نامی ندارد.</p>
      )}

      <ConfirmDelete
        open={deletingEnroll !== null}
        onClose={() => setDeletingEnroll(null)}
        label="این ثبت‌نام حذف شود؟"
        action={async (): Promise<ActionResult> =>
          deleteEnrollment(deletingEnroll ?? '')
        }
      />
    </div>
  );
}

function EnrollRow({
  enrollment,
  onDelete,
}: {
  enrollment: UserRow['enrollments'][number];
  onDelete: () => void;
}) {
  const api = useSaveAction(updateEnrollment);
  return (
    <div className="rounded-lg border border-cloud-200 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[13px] font-extrabold text-navy-900">{enrollment.courseTitle}</p>
        <StatusPill value={enrollment.status} />
      </div>
      <form onSubmit={api.onSubmit} className="grid grid-cols-1 items-end gap-2 sm:grid-cols-3">
        <input type="hidden" name="id" value={enrollment.id} />
        <AField label="وضعیت">
          <ASelect name="status" defaultValue={enrollment.status}>
            <option value="active">فعال</option>
            <option value="expired">منقضی</option>
            <option value="revoked">لغو شده</option>
          </ASelect>
        </AField>
        <div className="flex items-center gap-2">
          <AButton type="submit" variant="outline" className="h-8 px-3" disabled={api.pending}>
            {api.pending ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : null} ذخیره
          </AButton>
          <AButton
            type="button"
            variant="danger"
            className="h-8 px-3 border-0 bg-red-50 text-red-600 hover:bg-red-100"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </AButton>
        </div>
      </form>
    </div>
  );
}

/* ───────────────────────── Activity tab ───────────────────────── */

function ActivityTab({ user }: { user: UserRow }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="rounded-xl bg-cloud-100/70 p-4">
        <p className="flex items-center gap-2 text-[12px] font-bold text-ink-500">
          <BookOpen className="h-4 w-4" /> فاکتورها
        </p>
        <p className="mt-1 text-[20px] font-black text-navy-900">{user.invoiceCount.toLocaleString('fa-IR')}</p>
      </div>
      <div className="rounded-xl bg-cloud-100/70 p-4">
        <p className="flex items-center gap-2 text-[12px] font-bold text-ink-500">
          <Wallet className="h-4 w-4" /> تراکنش‌ها
        </p>
        <p className="mt-1 text-[20px] font-black text-navy-900">{user.transactionCount.toLocaleString('fa-IR')}</p>
      </div>
      <div className="rounded-xl bg-cloud-100/70 p-4 sm:col-span-2">
        <p className="text-[12px] font-bold text-ink-500">احراز هویت</p>
        <div className="mt-2 flex flex-wrap gap-4 text-[12.5px] text-navy-800">
          <span>موبایل: {user.mobileVerifiedAt ? fmtDateOnly(user.mobileVerifiedAt) : '—'}</span>
          <span>ایمیل: {user.emailVerifiedAt ? fmtDateOnly(user.emailVerifiedAt) : '—'}</span>
          <span>آخرین ورود: {user.lastLoginAt ? fmtDateOnly(user.lastLoginAt) : '—'}</span>
        </div>
      </div>
    </div>
  );
}
