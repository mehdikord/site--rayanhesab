'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, LoaderCircle, Eye } from 'lucide-react';
import {
  Td,
  EmptyRow,
  AButton,
  AField,
  AInput,
  ATextarea,
  ASelect,
  StatusPill,
  fmtDateOnly,
} from '@/app/admins/_components/kit';
import { toLocalInputValue } from '@/app/lib/datetime';
import { TableBare } from '@/app/admins/_components/kit';
import { Modal } from '@/app/admins/_components/Modal';
import { ConfirmDelete, type ActionResult } from '@/app/admins/_components/Confirm';
import { useSaveAction } from '@/app/admins/_components/useSaveAction';
import {
  updateCompany,
  deleteCompany,
  updateJobRequest,
  deleteJobRequest,
  updateTalentApplication,
  deleteTalentApplication,
  upsertReferral,
  deleteReferral,
} from './actions';

export interface CompanyRow {
  id: string;
  name: string;
  contactName: string;
  mobile: string;
  email: string | null;
  city: string | null;
  address: string | null;
  website: string | null;
  description: string | null;
  status: string;
  adminNote: string | null;
  jobCount: number;
  createdAt: string;
}
export interface JobRow {
  id: string;
  companyName: string;
  position: string;
  city: string;
  status: string;
  employmentType: string;
  salaryRange: string | null;
  adminNote: string | null;
  handledByName: string | null;
  referralCount: number;
  requiredExperience: string;
  skills: string;
  description: string | null;
  contactName: string;
  contactMobile: string;
  createdAt: string;
}
export interface TalentRow {
  id: string;
  fullName: string;
  mobile: string;
  email: string | null;
  city: string;
  position: string;
  experience: string;
  employmentType: string;
  status: string;
  adminNote: string | null;
  reviewedBy: string | null;
  reviewedByName: string | null;
  skills: string;
  intro: string;
  hasResume: boolean;
  createdAt: string;
}
export interface ReferralRow {
  id: string;
  jobRequestId: string;
  talentApplicationId: string;
  jobTitle: string;
  talentName: string;
  status: string;
  interviewAt: string | null;
  note: string | null;
  createdAt: string;
}

const EMP_TYPE: Record<string, string> = {
  full_time: 'تمام‌وقت',
  part_time: 'پاره‌وقت',
  project: 'پروژه‌ای',
  remote: 'دورکاری',
  internship: 'کارآموزی',
};
const EXP_LABEL: Record<string, string> = {
  none: 'بدون سابقه',
  one_to_three: '۱ تا ۳ سال',
  three_to_five: '۳ تا ۵ سال',
  five_to_ten: '۵ تا ۱۰ سال',
  over_five: 'بیش از ۵ سال',
  over_ten: 'بیش از ۱۰ سال',
};

type Tab = 'companies' | 'jobs' | 'talents' | 'referrals';

export function RecruitmentManager({
  companies,
  jobs,
  talents,
  referrals,
  talentOptions,
  jobOptions,
}: {
  companies: CompanyRow[];
  jobs: JobRow[];
  talents: TalentRow[];
  referrals: ReferralRow[];
  talentOptions: { id: string; name: string }[];
  jobOptions: { id: string; name: string }[];
}) {
  const [tab, setTab] = useState<Tab>('companies');

  const tabs: [Tab, string][] = [
    ['companies', `شرکت‌ها (${companies.length.toLocaleString('fa-IR')})`],
    ['jobs', `درخواست‌های شغلی (${jobs.length.toLocaleString('fa-IR')})`],
    ['talents', `کاندیداها (${talents.length.toLocaleString('fa-IR')})`],
    ['referrals', `معرف‌ها (${referrals.length.toLocaleString('fa-IR')})`],
  ];

  return (
    <div className="space-y-4 p-5">
      <div className="flex flex-wrap gap-1 rounded-lg bg-cloud-100 p-1">
        {tabs.map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={
              'rounded-md px-3 py-1.5 text-[12px] font-bold transition-colors ' +
              (tab === k ? 'bg-white text-navy-900 shadow-card' : 'text-ink-500 hover:text-navy-900')
            }
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'companies' ? <CompaniesSection rows={companies} /> : null}
      {tab === 'jobs' ? <JobsSection rows={jobs} /> : null}
      {tab === 'talents' ? <TalentsSection rows={talents} /> : null}
      {tab === 'referrals' ? (
        <ReferralsSection
          rows={referrals}
          jobOptions={jobOptions}
          talentOptions={talentOptions}
        />
      ) : null}
    </div>
  );
}

/* ───────────────────────── Companies ───────────────────────── */

function CompaniesSection({ rows }: { rows: CompanyRow[] }) {
  const [editing, setEditing] = useState<CompanyRow | null>(null);
  const [deleting, setDeleting] = useState<CompanyRow | null>(null);

  return (
    <div className="space-y-4">
      <TableBare columns={['شرکت', 'نماینده', 'موبایل', 'شهر', 'درخواست', 'وضعیت', 'تاریخ', 'عملیات']}>
        {rows.length === 0 ? (
          <EmptyRow colSpan={8} label="شرکتی ثبت نشده است" />
        ) : (
          rows.map((r) => (
            <tr key={r.id} className="transition-colors hover:bg-cloud-100/60">
              <Td><span className="font-extrabold text-navy-900">{r.name}</span></Td>
              <Td>{r.contactName}</Td>
              <Td><span dir="ltr" className="text-[12.5px]">{r.mobile}</span></Td>
              <Td>{r.city ?? '—'}</Td>
              <Td>{r.jobCount.toLocaleString('fa-IR')}</Td>
              <Td><StatusPill value={r.status} /></Td>
              <Td className="whitespace-nowrap text-[12px] text-ink-500">{fmtDateOnly(r.createdAt)}</Td>
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
      </TableBare>

      <CompanyModal open={editing !== null} onClose={() => setEditing(null)} initial={editing ?? undefined} />
      <ConfirmDelete
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        label={`«${deleting?.name ?? ''}» و درخواست‌های شغلی آن حذف شوند؟`}
        action={async (): Promise<ActionResult> => deleteCompany(deleting?.id ?? '')}
      />
    </div>
  );
}

function CompanyModal({ open, onClose, initial }: { open: boolean; onClose: () => void; initial?: CompanyRow }) {
  const api = useSaveAction(updateCompany);
  const c = initial;
  return (
    <Modal open={open} onClose={onClose} title={c ? 'ویرایش شرکت' : 'افزودن شرکت'} wide>
      {c ? (
        <form onSubmit={api.onSubmit} className="space-y-4">
          <input type="hidden" name="id" value={c.id} />
          {api.success ? <p className="text-[12.5px] font-bold text-emerald-700">ذخیره شد.</p> : null}
          {api.error ? <p className="text-[12.5px] font-bold text-red-600">{api.error}</p> : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AField label="نام شرکت"><AInput name="name" defaultValue={c.name} /></AField>
            <AField label="نماینده"><AInput name="contactName" defaultValue={c.contactName} /></AField>
            <AField label="موبایل"><AInput name="mobile" defaultValue={c.mobile} dir="ltr" className="text-left" /></AField>
            <AField label="ایمیل"><AInput name="email" defaultValue={c.email ?? ''} dir="ltr" className="text-left" /></AField>
            <AField label="شهر"><AInput name="city" defaultValue={c.city ?? ''} /></AField>
            <AField label="وب‌سایت"><AInput name="website" defaultValue={c.website ?? ''} dir="ltr" className="text-left" /></AField>
            <AField label="آدرس" className="sm:col-span-2"><AInput name="address" defaultValue={c.address ?? ''} /></AField>
            <AField label="توضیحات" className="sm:col-span-2"><ATextarea name="description" rows={2} defaultValue={c.description ?? ''} /></AField>
            <AField label="وضعیت">
              <ASelect name="status" defaultValue={c.status}>
                <option value="pending">در انتظار بررسی</option>
                <option value="approved">تأیید شده</option>
                <option value="rejected">رد شده</option>
              </ASelect>
            </AField>
            <AField label="یادداشت داخلی"><AInput name="adminNote" defaultValue={c.adminNote ?? ''} /></AField>
          </div>

          <div className="flex justify-end gap-2 border-t border-cloud-200 pt-4">
            <AButton variant="outline" type="button" onClick={onClose}>بستن</AButton>
            <AButton type="submit" disabled={api.pending}>
              {api.pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null} ذخیره
            </AButton>
          </div>
        </form>
      ) : null}
    </Modal>
  );
}

/* ───────────────────────── Job requests ───────────────────────── */

function JobsSection({ rows }: { rows: JobRow[] }) {
  const [opening, setOpening] = useState<JobRow | null>(null);
  const [deleting, setDeleting] = useState<JobRow | null>(null);

  return (
    <div className="space-y-4">
      <TableBare columns={['پوزیشن', 'شرکت', 'شهر', 'نوع', 'حقوق', 'معرف', 'وضعیت', 'عملیات']}>
        {rows.length === 0 ? (
          <EmptyRow colSpan={8} label="درخواست شغلی ثبت نشده است" />
        ) : (
          rows.map((r) => (
            <tr key={r.id} className="transition-colors hover:bg-cloud-100/60">
              <Td><span className="font-extrabold text-navy-900">{r.position}</span></Td>
              <Td>{r.companyName}</Td>
              <Td>{r.city}</Td>
              <Td>{EMP_TYPE[r.employmentType] ?? r.employmentType}</Td>
              <Td className="whitespace-nowrap text-[12.5px] text-ink-500">{r.salaryRange ?? '—'}</Td>
              <Td>{r.referralCount.toLocaleString('fa-IR')}</Td>
              <Td><StatusPill value={r.status} /></Td>
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

      <JobModal open={opening !== null} onClose={() => setOpening(null)} initial={opening ?? undefined} />
      <ConfirmDelete
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        label={`درخواست «${deleting?.position ?? ''}» در ${deleting?.companyName ?? ''} حذف شود؟`}
        action={async (): Promise<ActionResult> => deleteJobRequest(deleting?.id ?? '')}
      />
    </div>
  );
}

function JobModal({ open, onClose, initial }: { open: boolean; onClose: () => void; initial?: JobRow }) {
  const api = useSaveAction(updateJobRequest);
  const j = initial;
  return (
    <Modal open={open} onClose={onClose} title={`پوزیشن: ${j?.position ?? ''}`} description={j?.companyName}>
      {j ? (
        <form onSubmit={api.onSubmit} className="space-y-4">
          <input type="hidden" name="id" value={j.id} />
          <div className="rounded-lg bg-cloud-100/70 px-3 py-2 text-[12.5px] text-ink-500">
            {EMP_TYPE[j.employmentType] ?? j.employmentType} · {j.city}
            {j.salaryRange ? ` · ${j.salaryRange}` : ''}
            {j.handledByName ? ` · مسئول: ${j.handledByName}` : ''}
          </div>
          <div className="space-y-3 text-[13px] leading-7 text-navy-900">
            <p className="text-[12.5px] text-ink-500">
              رابط: {j.contactName} · <span dir="ltr">{j.contactMobile}</span> · سابقه لازم: {EXP_LABEL[j.requiredExperience] ?? j.requiredExperience}
            </p>
            <div>
              <p className="text-[11.5px] font-bold text-ink-400">مهارت‌های مورد نیاز</p>
              <p className="whitespace-pre-line">{j.skills}</p>
            </div>
            {j.description ? (
              <div>
                <p className="text-[11.5px] font-bold text-ink-400">توضیحات</p>
                <p className="whitespace-pre-line">{j.description}</p>
              </div>
            ) : null}
          </div>
          {api.success ? <p className="text-[12.5px] font-bold text-emerald-700">ذخیره شد.</p> : null}
          {api.error ? <p className="text-[12.5px] font-bold text-red-600">{api.error}</p> : null}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AField label="وضعیت">
              <ASelect name="status" defaultValue={j.status}>
                <option value="new">جدید</option>
                <option value="reviewing">در حال بررسی</option>
                <option value="open">باز</option>
                <option value="filled">تکمیل شد</option>
                <option value="closed">بسته</option>
                <option value="cancelled">لغو شده</option>
              </ASelect>
            </AField>
            <AField label="یادداشت داخلی"><AInput name="adminNote" defaultValue={j.adminNote ?? ''} /></AField>
          </div>
          <div className="flex justify-end gap-2">
            <AButton variant="outline" type="button" onClick={onClose}>بستن</AButton>
            <AButton type="submit" disabled={api.pending}>
              {api.pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null} ذخیره
            </AButton>
          </div>
        </form>
      ) : null}
    </Modal>
  );
}

/* ───────────────────────── Talent applications ───────────────────────── */

function TalentsSection({ rows }: { rows: TalentRow[] }) {
  const [opening, setOpening] = useState<TalentRow | null>(null);
  const [deleting, setDeleting] = useState<TalentRow | null>(null);

  return (
    <div className="space-y-4">
      <TableBare columns={['نام', 'موبایل', 'پوزیشن', 'سابقه', 'وضعیت', 'عملیات']}>
        {rows.length === 0 ? (
          <EmptyRow colSpan={6} label="آپلیکیشنی ثبت نشده است" />
        ) : (
          rows.map((r) => (
            <tr key={r.id} className="transition-colors hover:bg-cloud-100/60">
              <Td>
                <p className="font-extrabold text-navy-900">{r.fullName}</p>
                <p className="text-[11.5px] text-ink-400">{r.city}</p>
              </Td>
              <Td><span dir="ltr" className="text-[12.5px]">{r.mobile}</span></Td>
              <Td>{r.position}</Td>
              <Td>{EXP_LABEL[r.experience] ?? r.experience}</Td>
              <Td><StatusPill value={r.status} /></Td>
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

      <TalentModal open={opening !== null} onClose={() => setOpening(null)} initial={opening ?? undefined} />
      <ConfirmDelete
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        label={`آپلیکیشن «${deleting?.fullName ?? ''}» حذف شود؟`}
        action={async (): Promise<ActionResult> => deleteTalentApplication(deleting?.id ?? '')}
      />
    </div>
  );
}

function TalentModal({ open, onClose, initial }: { open: boolean; onClose: () => void; initial?: TalentRow }) {
  const api = useSaveAction(updateTalentApplication);
  const t = initial;
  return (
    <Modal open={open} onClose={onClose} title={`کاندیدا: ${t?.fullName ?? ''}`} description={t?.position}>
      {t ? (
        <div className="space-y-4">
          <div className="rounded-lg bg-cloud-100/70 px-3 py-2.5 text-[12.5px] leading-6 text-ink-500">
            <p dir="ltr" className="text-right">{t.mobile}{t.email ? ` · ${t.email}` : ''}</p>
            <p>{EMP_TYPE[t.employmentType] ?? t.employmentType} · {EXP_LABEL[t.experience] ?? t.experience} · {t.city}</p>
            {t.reviewedByName ? <p>بررسی‌کننده: {t.reviewedByName}</p> : null}
          </div>

          <div className="space-y-3 text-[13px] leading-7 text-navy-900">
            <div>
              <p className="text-[11.5px] font-bold text-ink-400">مهارت‌ها</p>
              <p className="whitespace-pre-line">{t.skills}</p>
            </div>
            <div>
              <p className="text-[11.5px] font-bold text-ink-400">معرفی</p>
              <p className="whitespace-pre-line">{t.intro}</p>
            </div>
            {t.hasResume ? (
              <a
                href={`/admins/api/resume/${t.id}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-cloud-300 px-3 py-2 text-[12.5px] font-bold text-brand-700 hover:bg-cloud-100"
              >
                دانلود رزومه
              </a>
            ) : (
              <p className="text-[12px] text-ink-400">رزومه‌ای بارگذاری نشده است.</p>
            )}
          </div>

          <form onSubmit={api.onSubmit} className="space-y-4">
            <input type="hidden" name="id" value={t.id} />
            {api.success ? <p className="text-[12.5px] font-bold text-emerald-700">ذخیره شد.</p> : null}
            {api.error ? <p className="text-[12.5px] font-bold text-red-600">{api.error}</p> : null}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <AField label="وضعیت">
                <ASelect name="status" defaultValue={t.status}>
                  <option value="new">جدید</option>
                  <option value="reviewing">در حال بررسی</option>
                  <option value="approved">تأیید شده</option>
                  <option value="introduced">معرفی شده</option>
                  <option value="hired">استخدام شد</option>
                  <option value="rejected">رد شده</option>
                </ASelect>
              </AField>
              <AField label="یادداشت داخلی"><AInput name="adminNote" defaultValue={t.adminNote ?? ''} /></AField>
            </div>
            <div className="flex justify-end gap-2">
              <AButton variant="outline" type="button" onClick={onClose}>بستن</AButton>
              <AButton type="submit" disabled={api.pending}>
                {api.pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null} ذخیره
              </AButton>
            </div>
          </form>
        </div>
      ) : null}
    </Modal>
  );
}

/* ───────────────────────── Referrals ───────────────────────── */

function ReferralsSection({
  rows,
  jobOptions,
  talentOptions,
}: {
  rows: ReferralRow[];
  jobOptions: { id: string; name: string }[];
  talentOptions: { id: string; name: string }[];
}) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<ReferralRow | null>(null);
  const [deleting, setDeleting] = useState<ReferralRow | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[12.5px] text-ink-500">اتصال یک کاندیدا به یک درخواست شغلی (معرف‌).</p>
        <AButton onClick={() => setAdding(true)} disabled={jobOptions.length === 0 || talentOptions.length === 0}>
          <Plus className="h-4 w-4" /> افزودن معرف
        </AButton>
      </div>

      <TableBare columns={['پوزیشن', 'کاندیدا', 'وضعیت', 'مصاحبه', 'تاریخ', 'عملیات']}>
        {rows.length === 0 ? (
          <EmptyRow colSpan={6} label="معرفی ثبت نشده است" />
        ) : (
          rows.map((r) => (
            <tr key={r.id} className="transition-colors hover:bg-cloud-100/60">
              <Td><span className="font-bold text-navy-900">{r.jobTitle}</span></Td>
              <Td>{r.talentName}</Td>
              <Td><StatusPill value={r.status} /></Td>
              <Td className="whitespace-nowrap text-[12px] text-ink-500">
                {r.interviewAt ? fmtDateOnly(r.interviewAt) : '—'}
              </Td>
              <Td className="whitespace-nowrap text-[12px] text-ink-500">{fmtDateOnly(r.createdAt)}</Td>
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
      </TableBare>

      <ReferralModal
        open={adding}
        onClose={() => setAdding(false)}
        jobOptions={jobOptions}
        talentOptions={talentOptions}
      />
      <ReferralModal
        open={editing !== null}
        onClose={() => setEditing(null)}
        initial={editing ?? undefined}
      />
      <ConfirmDelete
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        label={`معرفی «${deleting?.talentName ?? ''}» به «${deleting?.jobTitle ?? ''}» حذف شود؟`}
        action={async (): Promise<ActionResult> => deleteReferral(deleting?.id ?? '')}
      />
    </div>
  );
}

function ReferralModal({
  open,
  onClose,
  initial,
  jobOptions,
  talentOptions,
}: {
  open: boolean;
  onClose: () => void;
  initial?: ReferralRow;
  jobOptions?: { id: string; name: string }[];
  talentOptions?: { id: string; name: string }[];
}) {
  const api = useSaveAction(upsertReferral);
  const r = initial;

  return (
    <Modal open={open} onClose={onClose} title={r ? 'ویرایش معرف' : 'افزودن معرف'}>
      <form onSubmit={api.onSubmit} className="space-y-4">
        <input type="hidden" name="id" value={r?.id ?? ''} />
        {api.success ? <p className="text-[12.5px] font-bold text-emerald-700">ذخیره شد.</p> : null}
        {api.error ? <p className="text-[12.5px] font-bold text-red-600">{api.error}</p> : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AField label="درخواست شغلی" required>
            <ASelect name="jobRequestId" defaultValue={r?.jobRequestId ?? ''}>
              <option value="">— انتخاب کنید —</option>
              {(jobOptions ?? []).map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </ASelect>
          </AField>
          <AField label="کاندیدا" required>
            <ASelect name="talentApplicationId" defaultValue={r?.talentApplicationId ?? ''}>
              <option value="">— انتخاب کنید —</option>
              {(talentOptions ?? []).map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </ASelect>
          </AField>
          <AField label="وضعیت">
            <ASelect name="status" defaultValue={r?.status ?? 'introduced'}>
              <option value="introduced">معرفی شده</option>
              <option value="interview">مصاحبه</option>
              <option value="hired">استخدام شد</option>
              <option value="rejected">رد شد</option>
            </ASelect>
          </AField>
          <AField label="زمان مصاحبه">
            <AInput
              name="interviewAt"
              type="datetime-local"
              defaultValue={toLocalInputValue(r?.interviewAt)}
              dir="ltr"
              className="text-left"
            />
          </AField>
          <AField label="یادداشت" className="sm:col-span-2">
            <ATextarea name="note" rows={2} defaultValue={r?.note ?? ''} />
          </AField>
        </div>

        <div className="flex justify-end gap-2 border-t border-cloud-200 pt-4">
          <AButton variant="outline" type="button" onClick={onClose}>بستن</AButton>
          <AButton type="submit" disabled={api.pending}>
            {api.pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            {r ? 'ذخیره' : 'افزودن معرف'}
          </AButton>
        </div>
      </form>
    </Modal>
  );
}
