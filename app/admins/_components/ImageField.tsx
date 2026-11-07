'use client';

import { useRef, useState } from 'react';
import { ImageUp, LoaderCircle, X } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { controlCls } from './kit';

/**
 * Image path input with an upload button. The value is submitted with the
 * surrounding form under `name`; uploading fills it with the stored URL.
 * Admins can still paste a path from /public (e.g. /images/…) by hand.
 */
export function ImageField({
  name,
  defaultValue,
  folder,
}: {
  name: string;
  defaultValue?: string | null;
  folder: 'services' | 'courses' | 'articles' | 'team' | 'instructors' | 'users' | 'general';
}) {
  const [value, setValue] = useState(defaultValue ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setError('');
    setBusy(true);
    try {
      const body = new FormData();
      body.set('file', file);
      body.set('folder', folder);
      const res = await fetch('/admins/api/upload', { method: 'POST', body });
      const json = (await res.json().catch(() => null)) as { ok?: boolean; url?: string; message?: string } | null;
      if (res.ok && json?.ok && json.url) setValue(json.url);
      else setError(json?.message ?? 'بارگذاری ناموفق بود.');
    } catch {
      setError('بارگذاری ناموفق بود.');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  const previewable = value.startsWith('/');

  return (
    <span className="block">
      <span className="flex items-center gap-2">
        {previewable ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-10 w-10 shrink-0 rounded-lg border border-cloud-300 object-cover" />
        ) : null}
        <input
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          dir="ltr"
          placeholder="/uploads/… یا /images/…"
          className={cn(controlCls, 'text-left')}
        />
        {value ? (
          <button
            type="button"
            onClick={() => setValue('')}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-cloud-300 text-ink-400 hover:bg-cloud-100 hover:text-red-600"
            aria-label="حذف تصویر"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-navy-900 px-3 text-[12px] font-bold text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ImageUp className="h-4 w-4" />}
          بارگذاری
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void upload(f);
          }}
        />
      </span>
      {error ? <span className="mt-1 block text-[11.5px] font-semibold text-red-600">{error}</span> : null}
    </span>
  );
}
