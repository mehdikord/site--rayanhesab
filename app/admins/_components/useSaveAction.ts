'use client';

import { useState, useTransition } from 'react';
import type { ActionResult } from './Confirm';

/**
 * Submit an HTML form to a server action that returns an ActionResult.
 * The action revalidates its route, so the page re-renders with fresh data;
 * `success` flips to true when the action reports ok (e.g. to close a modal).
 */
export function useSaveAction(
  action: (formData: FormData) => Promise<ActionResult>,
) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      setSuccess(false);
      const res = await action(fd);
      if (res.ok) {
        setError(null);
        setSuccess(true);
      } else {
        setSuccess(false);
        setError(res.message ?? 'خطا در ذخیره‌سازی. دوباره تلاش کنید.');
      }
    });
  };

  const reset = () => {
    setError(null);
    setSuccess(false);
  };

  return { onSubmit, pending, error, success, reset };
}
