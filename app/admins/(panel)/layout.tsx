import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getAdminSession } from '@/app/admins/lib/auth';
import { AdminShell } from './_shell/AdminShell';

export const metadata: Metadata = {
  title: {
    default: 'پنل مدیریت | رایان حساب',
    template: '%s | پنل مدیریت رایان حساب',
  },
  robots: { index: false, follow: false },
};

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  // Authoritative guard: the proxy already bounced anonymous traffic, and the
  // session cookie is httpOnly so it cannot be forged from client JS.
  const session = await getAdminSession();
  if (!session) redirect('/admins/login');

  return <AdminShell userName={session.name}>{children}</AdminShell>;
}
