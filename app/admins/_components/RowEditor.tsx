'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Card } from './kit';
import { ConfirmDelete, type ActionResult } from './Confirm';

/**
 * Card chrome for a nested row (feature, faq, step, chapter, lesson…).
 * Renders a header with the row's display title and a delete button, then the
 * form fields (children) below. `onRemove` is the delete action for this row.
 */
export function RowShell({
  title,
  subtitle,
  onRemove,
  children,
}: {
  title: string;
  subtitle?: string;
  onRemove: () => Promise<ActionResult>;
  children: React.ReactNode;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <Card>
      <div className="flex items-center justify-between gap-3 border-b border-cloud-200 px-4 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-extrabold text-navy-900" dir="auto">
            {title || '—'}
          </p>
          {subtitle ? <p className="truncate text-[11.5px] text-ink-400" dir="auto">{subtitle}</p> : null}
        </div>
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-red-50 hover:text-red-600"
          aria-label="حذف"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="p-4">{children}</div>
      <ConfirmDelete
        open={confirming}
        onClose={() => setConfirming(false)}
        label={`«${title}» حذف شود؟`}
        action={onRemove}
      />
    </Card>
  );
}
