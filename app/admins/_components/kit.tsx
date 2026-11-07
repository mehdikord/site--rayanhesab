import { cn } from '@/app/lib/utils';

/* ───────────────────────── Cards & headers ───────────────────────── */

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('rounded-2xl border border-cloud-200 bg-white shadow-card', className)}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3 border-b border-cloud-200 px-5 py-4', className)}>
      <div className="min-w-0">
        <h2 className="text-[15px] font-extrabold text-navy-900">{title}</h2>
        {description ? <p className="mt-0.5 text-[12px] text-ink-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function PageTitle({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[22px] font-black tracking-tight text-navy-900">{title}</h1>
        {description ? <p className="mt-1 text-[13px] text-ink-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

/* ───────────────────────── Buttons (admin) ───────────────────────── */

type BtnVariant = 'primary' | 'outline' | 'ghost' | 'danger';

const adminBtn: Record<BtnVariant, string> = {
  primary: 'bg-navy-800 text-white hover:bg-navy-900 shadow-card',
  outline: 'border border-cloud-300 bg-white text-navy-800 hover:bg-cloud-100',
  ghost: 'text-ink-700 hover:bg-cloud-200',
  danger: 'border border-red-200 bg-white text-red-600 hover:bg-red-50',
};

export function AButton({
  variant = 'primary',
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant }) {
  return (
    <button
      className={cn(
        'inline-flex h-9 select-none items-center justify-center gap-1.5 rounded-lg px-3.5 text-[13px] font-bold transition-colors disabled:pointer-events-none disabled:opacity-55',
        adminBtn[variant],
        className,
      )}
      {...props}
    />
  );
}

export function ALinkButton({
  href,
  variant = 'outline',
  className,
  children,
}: {
  href: string;
  variant?: BtnVariant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className={cn(
        'inline-flex h-9 select-none items-center justify-center gap-1.5 rounded-lg px-3.5 text-[13px] font-bold transition-colors',
        adminBtn[variant],
        className,
      )}
    >
      {children}
    </a>
  );
}

/* ───────────────────────── Form controls (admin) ───────────────────────── */

export const controlCls =
  'w-full rounded-lg border border-cloud-300 bg-white px-3 py-2.5 text-[13px] text-navy-900 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15';

export function AField({
  label,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn('block min-w-0', className)}>
      <span className="mb-1.5 block text-[12.5px] font-bold text-navy-800">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-[11.5px] text-ink-400">{hint}</span> : null}
    </label>
  );
}

export function AInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlCls, className)} {...props} />;
}

export function ATextarea({
  className,
  rows = 4,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { rows?: number }) {
  return <textarea rows={rows} className={cn(controlCls, 'resize-y', className)} {...props} />;
}

export function ASelect({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(controlCls, 'appearance-none bg-white pl-8', className)} {...props}>
      {children}
    </select>
  );
}

export function ACheckbox({
  label,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className={cn('inline-flex cursor-pointer items-center gap-2', className)}>
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-cloud-400 accent-brand-600"
        {...props}
      />
      {label ? <span className="text-[12.5px] font-medium text-navy-800">{label}</span> : null}
    </label>
  );
}

/* ───────────────────────── Pills & stats ───────────────────────── */

const pillMap: Record<string, string> = {
  // status → classes
  new: 'bg-brand-50 text-brand-700 ring-brand-600/15',
  in_progress: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  done: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  cancelled: 'bg-red-50 text-red-600 ring-red-500/15',
  read: 'bg-sky-50 text-sky-700 ring-sky-600/15',
  replied: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  archived: 'bg-cloud-200 text-ink-500 ring-cloud-400/40',
  draft: 'bg-cloud-200 text-ink-500 ring-cloud-400/40',
  published: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  rejected: 'bg-red-50 text-red-600 ring-red-500/15',
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  expired: 'bg-cloud-200 text-ink-500 ring-cloud-400/40',
  revoked: 'bg-red-50 text-red-600 ring-red-500/15',
  paid: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  failed: 'bg-red-50 text-red-600 ring-red-500/15',
  refunded: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  open: 'bg-sky-50 text-sky-700 ring-sky-600/15',
  reviewing: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  filled: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  closed: 'bg-cloud-200 text-ink-500 ring-cloud-400/40',
  introduced: 'bg-sky-50 text-sky-700 ring-sky-600/15',
  interview: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  hired: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  deposit: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  withdraw: 'bg-amber-50 text-amber-700 ring-amber-600/20',
};

export const faStatusLabel: Record<string, string> = {
  new: 'جدید',
  in_progress: 'در حال بررسی',
  done: 'انجام شد',
  cancelled: 'لغو شده',
  read: 'خوانده شد',
  replied: 'پاسخ داده شد',
  archived: 'بایگانی',
  draft: 'پیش‌نویس',
  published: 'منتشر شده',
  pending: 'در انتظار',
  approved: 'تأیید شده',
  rejected: 'رد شده',
  active: 'فعال',
  expired: 'منقضی',
  revoked: 'لغو‌شده',
  paid: 'پرداخت شده',
  failed: 'ناموفق',
  refunded: 'استرداد شده',
  success: 'موفق',
  open: 'باز',
  reviewing: 'در حال بررسی',
  filled: 'تکمیل شد',
  closed: 'بسته',
  introduced: 'معرفی شده',
  interview: 'مصاحبه',
  hired: 'استخدام شد',
  deposit: 'واریز',
  withdraw: 'برداشت',
};

export function StatusPill({ value, className }: { value: string | null | undefined; className?: string }) {
  if (!value) return <span className="text-[11.5px] text-ink-400">—</span>;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11.5px] font-bold ring-1 ring-inset',
        pillMap[value] ?? 'bg-cloud-200 text-ink-700 ring-cloud-400/40',
        className,
      )}
    >
      {faStatusLabel[value] ?? value}
    </span>
  );
}

export function Stat({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-bold text-ink-500">{label}</p>
          <p className="mt-1.5 text-[26px] font-black leading-none text-navy-900" dir="ltr">
            {value}
          </p>
          {hint ? <p className="mt-1.5 text-[11.5px] text-ink-400">{hint}</p> : null}
        </div>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
          {icon}
        </div>
      </div>
    </Card>
  );
}

/* ───────────────────────── Tables ───────────────────────── */

export function TableCard({
  columns,
  children,
  className,
}: {
  columns: string[];
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <TableBare columns={columns}>{children}</TableBare>
    </Card>
  );
}

export function TableBare({
  columns,
  children,
}: {
  columns: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-right">
        <thead>
          <tr className="border-b border-cloud-200 bg-cloud-100/70">
            {columns.map((c) => (
              <th
                key={c}
                className="whitespace-nowrap px-4 py-3 text-[11.5px] font-bold tracking-wide text-ink-500"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-cloud-200/80">{children}</tbody>
      </table>
    </div>
  );
}

export function Td({
  className,
  children,
  colSpan,
  dir,
}: {
  className?: string;
  children: React.ReactNode;
  colSpan?: number;
  dir?: 'ltr' | 'rtl';
}) {
  return (
    <td colSpan={colSpan} dir={dir} className={cn('px-4 py-3 align-middle text-[13px] text-navy-800', className)}>
      {children}
    </td>
  );
}

export function EmptyRow({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-14 text-center">
        <p className="text-[14px] font-bold text-ink-500">{label}</p>
        <p className="mt-1 text-[12px] text-ink-400">هنوز موردی ثبت نشده است</p>
      </td>
    </tr>
  );
}

export function Notice({ tone, children }: { tone: 'error' | 'success' | 'info'; children: React.ReactNode }) {
  const map = {
    error: 'bg-red-50 text-red-700 ring-red-500/15',
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-500/20',
    info: 'bg-brand-50 text-brand-700 ring-brand-500/15',
  } as const;
  return (
    <div role="alert" className={cn('rounded-lg px-3 py-2.5 text-[12.5px] font-semibold ring-1 ring-inset', map[tone])}>
      {children}
    </div>
  );
}

/* ───────────────────────── Misc ───────────────────────── */

export function formatToman(n: number | string | null | undefined): string {
  if (n === null || n === undefined || n === '') return '—';
  const num = typeof n === 'string' ? Number(n) : n;
  if (Number.isNaN(num)) return '—';
  return `${num.toLocaleString('fa-IR')} تومان`;
}

export function formatDate(d: string | Date | null | undefined): string {
  if (!d) return '—';
  try {
    return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(d));
  } catch {
    return String(d);
  }
}

export function fmtDateOnly(d: string | Date | null | undefined): string {
  if (!d) return '—';
  try {
    return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' }).format(new Date(d));
  } catch {
    return String(d);
  }
}
