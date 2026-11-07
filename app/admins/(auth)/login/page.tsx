import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/app/admins/lib/auth';
import { LoginForm } from './_LoginForm';

export const metadata = { title: 'ورود به پنل مدیریت' };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getAdminSession();
  if (session) redirect('/admins');
  const { next } = await searchParams;

  return (
    <div className="ledger-grid flex min-h-screen items-center justify-center bg-navy-950 px-4 py-10">
      <div className="w-full max-w-[420px]">
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white shadow-lift">
            <Image
              src="/logo.png"
              alt="رایان حساب صبا"
              width={44}
              height={44}
              className="object-contain"
            />
          </div>
          <div className="text-center">
            <h1 className="text-[22px] font-extrabold text-white">پنل مدیریت رایان حساب</h1>
            <p className="mt-1.5 text-[13px] text-white/55">
              برای ادامه، با موبایل و رمز عبور وارد شوید
            </p>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-lift sm:p-8">
          <LoginForm next={typeof next === 'string' ? next : ''} />
        </div>

        <p className="mt-6 text-center text-[11.5px] text-white/35">
          دسترسی فقط برای مدیران مجاز سایت
        </p>
      </div>
    </div>
  );
}
