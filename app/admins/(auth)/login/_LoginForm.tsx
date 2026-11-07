'use client';

import { useActionState } from 'react';
import { LoaderCircle, ShieldCheck } from 'lucide-react';
import { login, type LoginState } from '@/app/admins/actions';

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    login,
    { error: null },
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <div>
        <label
          htmlFor="mobile"
          className="mb-2 block text-[13px] font-bold text-navy-800"
        >
          شماره موبایل
        </label>
        <input
          id="mobile"
          name="mobile"
          type="tel"
          inputMode="tel"
          dir="ltr"
          autoComplete="tel"
          placeholder="09120000000"
          className="h-12 w-full rounded-xl border border-cloud-300 bg-white px-4 text-right text-[14px] text-navy-900 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-[13px] font-bold text-navy-800"
        >
          رمز عبور
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          className="h-12 w-full rounded-xl border border-cloud-300 bg-white px-4 text-right text-[14px] text-navy-900 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
        />
      </div>

      {state.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2.5 text-[13px] font-medium text-red-700">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-navy-900 text-[14px] font-bold text-white shadow-lift transition-all hover:bg-navy-950 disabled:opacity-60"
      >
        {pending ? (
          <>
            <LoaderCircle className="h-4 w-4 animate-spin" /> در حال ورود…
          </>
        ) : (
          <>
            <ShieldCheck className="h-4 w-4" /> ورود به پنل
          </>
        )}
      </button>
    </form>
  );
}
