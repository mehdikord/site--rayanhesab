'use client';

import { useRef, useState } from 'react';
import { AlertCircle, ChevronDown, Upload, X, FileText } from 'lucide-react';
import { cn } from '@/app/lib/utils';

export function Field({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="block text-[13.5px] font-semibold text-navy-900">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {hint && <p className="mt-1 text-[12px] text-ink-400">{hint}</p>}
      <div className="mt-2">{children}</div>
      {error && (
        <p className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-red-600" role="alert">
          <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

const controlBase =
  'w-full rounded-[14px] border bg-white px-4 py-3.5 text-[14px] text-navy-900 outline-none transition-colors placeholder:text-ink-400';

export function TextInput({
  error,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      className={cn(
        controlBase,
        error
          ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/15'
          : 'border-cloud-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15',
        className,
      )}
      aria-invalid={error ? 'true' : 'false'}
      {...props}
    />
  );
}

export function TextArea({
  error,
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
  return (
    <textarea
      className={cn(
        controlBase,
        'resize-none',
        error
          ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/15'
          : 'border-cloud-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15',
        className,
      )}
      aria-invalid={error ? 'true' : 'false'}
      {...props}
    />
  );
}

export function SelectInput({
  error,
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }) {
  return (
    <div className="relative">
      <select
        className={cn(
          controlBase,
          'appearance-none pe-10',
          error
            ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/15'
            : 'border-cloud-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15',
          className,
        )}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" aria-hidden="true" />
    </div>
  );
}

export function FileUpload({
  label,
  hint,
  accept = '.pdf,.doc,.docx',
  maxSizeMb = 5,
  error,
  onFileChange,
}: {
  label: string;
  hint?: string;
  accept?: string;
  maxSizeMb?: number;
  error?: string;
  onFileChange?: (file: File | null) => void;
}) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    setLocalError(null);
    if (!file) return;
    if (file.size > maxSizeMb * 1024 * 1024) {
      setLocalError(`حجم فایل نباید بیشتر از ${maxSizeMb} مگابایت باشد.`);
      setFileName(null);
      onFileChange?.(null);
      return;
    }
    setFileName(file.name);
    onFileChange?.(file);
  };

  const shownError = localError ?? error;

  return (
    <div>
      <span className="block text-[13.5px] font-semibold text-navy-900">
        {label}
        {hint && <span className="ms-2 text-[11.5px] font-normal text-ink-400">{hint}</span>}
      </span>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          'mt-2 flex items-center gap-4 rounded-[14px] border border-dashed px-4 py-4 transition-colors',
          dragging ? 'border-brand-500 bg-brand-50' : 'border-cloud-400 bg-cloud-100',
          shownError && 'border-red-400 bg-red-50/40',
        )}
      >
        <input
          ref={inputRef}
          id="resume-upload"
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-brand-600 shadow-card">
          {fileName ? <FileText className="h-5 w-5" aria-hidden="true" /> : <Upload className="h-5 w-5" aria-hidden="true" />}
        </span>
        <div className="min-w-0 flex-1">
          {fileName ? (
            <p className="truncate text-[13px] font-semibold text-navy-900" dir="auto">{fileName}</p>
          ) : (
            <p className="text-[13px] text-ink-500">فایل رزومه را اینجا رها کنید یا انتخاب کنید</p>
          )}
          <p className="mt-0.5 text-[11.5px] text-ink-400">PDF یا Word — حداکثر {maxSizeMb} مگابایت (فقط نمایشی، بارگذاری نمی‌شود)</p>
        </div>
        {fileName ? (
          <button
            type="button"
            onClick={() => {
              setFileName(null);
              onFileChange?.(null);
              if (inputRef.current) inputRef.current.value = '';
            }}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-400 hover:bg-white"
            aria-label="حذف فایل"
          >
            <X className="h-5 w-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="shrink-0 rounded-full border border-cloud-300 bg-white px-4 py-2 text-[12.5px] font-bold text-navy-900 hover:bg-cloud-100"
          >
            انتخاب فایل
          </button>
        )}
      </div>
      {shownError && (
        <p className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-red-600" role="alert">
          <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
          {shownError}
        </p>
      )}
    </div>
  );
}
