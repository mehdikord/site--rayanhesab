'use client';

import { useState, useTransition } from 'react';
import { LoaderCircle, TriangleAlert } from 'lucide-react';
import { Modal } from './Modal';
import { AButton, Notice } from './kit';

export interface ActionResult {
  ok: boolean;
  message?: string;
}

/**
 * Two-step delete flow: opens a confirm modal, submits the given server action,
 * shows the result, and notifies the parent on success (e.g. to drop the row
 * from local state or trigger a re-render).
 */
export function ConfirmDelete({
  open,
  onClose,
  onDone,
  label,
  action,
}: {
  open: boolean;
  onClose: () => void;
  onDone?: () => void;
  label: string;
  action: () => Promise<ActionResult>;
}) {
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const submit = () => {
    setErr(null);
    start(async () => {
      const res = await action();
      if (res.ok) {
        onDone?.();
        onClose();
      } else {
        setErr(res.message ?? 'عملیات انجام نشد.');
      }
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="تأیید حذف">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-50 text-red-600">
            <TriangleAlert className="h-5 w-5" />
          </span>
          <p className="pt-1.5 text-[13.5px] leading-6 text-navy-800">
            {label}
            <span className="mt-0.5 block text-[12.5px] text-ink-500">
              این عملیات قابل بازگشت نیست.
            </span>
          </p>
        </div>
        {err ? <Notice tone="error">{err}</Notice> : null}
        <div className="flex items-center justify-end gap-2">
          <AButton variant="outline" type="button" onClick={onClose}>
            انصراف
          </AButton>
          <AButton
            variant="danger"
            type="button"
            disabled={pending}
            onClick={submit}
            className="border-0 bg-red-600 text-white hover:bg-red-700"
          >
            {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            بله، حذف شود
          </AButton>
        </div>
      </div>
    </Modal>
  );
}
