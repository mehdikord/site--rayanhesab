'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Layers,
  GraduationCap,
  FileText,
  Users,
  UserSquare,
  Tags,
  Ticket,
  Receipt,
  UserCircle,
  MessageCircle,
  Mail,
  Briefcase,
  Settings2,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { logout } from '@/app/admins/actions';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV: { section?: string; items: NavItem[] }[] = [
  {
    items: [{ label: 'داشبورد', href: '/admins', icon: LayoutDashboard }],
  },
  {
    section: 'محتوای سایت',
    items: [
      { label: 'خدمات', href: '/admins/services', icon: Layers },
      { label: 'دوره‌ها', href: '/admins/courses', icon: GraduationCap },
      { label: 'مقالات', href: '/admins/articles', icon: FileText },
      { label: 'تیم', href: '/admins/team', icon: Users },
      { label: 'اساتید', href: '/admins/instructors', icon: UserSquare },
      { label: 'دسته‌ها و برچسب‌ها', href: '/admins/categories', icon: Tags },
    ],
  },
  {
    section: 'معاملات',
    items: [
      { label: 'کوپن‌ها', href: '/admins/coupons', icon: Ticket },
      { label: 'فاکتورها', href: '/admins/invoices', icon: Receipt },
      { label: 'کاربران', href: '/admins/users', icon: UserCircle },
    ],
  },
  {
    section: 'درخواست‌ها',
    items: [
      { label: 'مشاوره‌ها', href: '/admins/consultations', icon: MessageCircle },
      { label: 'پیام‌ها', href: '/admins/messages', icon: Mail },
      { label: 'جذب نیرو', href: '/admins/recruitment', icon: Briefcase },
    ],
  },
  {
    section: 'سیستم',
    items: [
      { label: 'تنظیمات', href: '/admins/settings', icon: Settings2 },
      { label: 'مدیران', href: '/admins/admins', icon: ShieldCheck },
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === '/admins') return pathname === '/admins';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="منوی پنل" className="flex-1 space-y-5 overflow-y-auto px-3 py-5">
      {NAV.map((group) => (
        <div key={group.section ?? '__top'}>
          {group.section ? (
            <p className="px-3 pb-2 text-[10.5px] font-extrabold tracking-wider text-white/35">
              {group.section}
            </p>
          ) : null}
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      'group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors',
                      active
                        ? 'bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]'
                        : 'text-white/60 hover:bg-white/5 hover:text-white',
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    <item.icon
                      className={cn(
                        'h-[17px] w-[17px] shrink-0',
                        active ? 'text-brand-300' : 'text-white/40 group-hover:text-white/70',
                      )}
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function SidebarBody({ userName, onNavigate }: { userName: string; onNavigate?: () => void }) {
  return (
    <>
      <div className="flex items-center gap-3 border-b border-white/8 px-5 py-4">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-white">
          <Image src="/logo.png" alt="رایان حساب" width={34} height={34} className="object-contain" />
        </div>
        <div className="leading-none">
          <p className="text-[14px] font-extrabold text-white">رایان حساب</p>
          <p className="mt-1 text-[10px] font-bold tracking-[0.25em] text-white/40" dir="ltr">
            ADMIN
          </p>
        </div>
      </div>

      <NavList onNavigate={onNavigate} />

      <div className="border-t border-white/8 p-3">
        <div className="mb-2 flex items-center gap-2.5 rounded-xl bg-white/5 px-3 py-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-500/25 text-[12px] font-black text-brand-200">
            {userName.trim().charAt(0) || 'م'}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12.5px] font-bold text-white/90">{userName}</p>
            <p className="text-[10.5px] text-white/40">مدیر سیستم</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/"
            target="_blank"
            className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-white/5 text-[12px] font-bold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ExternalLink className="h-3.5 w-3.5" /> سایت
          </Link>
          <button
              type="button"
              onClick={() => {
                void logout();
              }}
              className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-white/5 text-[12px] font-bold text-white/70 transition-colors hover:bg-red-500/20 hover:text-red-300"
            >
              <LogOut className="h-3.5 w-3.5" /> خروج
            </button>
        </div>
      </div>
    </>
  );
}

export function AdminShell({ userName, children }: { userName: string; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cloud-100">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 right-0 z-40 hidden w-60 flex-col bg-navy-950 md:flex">
        <SidebarBody userName={userName} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-navy-950/60 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 right-0 flex w-64 flex-col bg-navy-950 shadow-lift">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute left-3 top-3 grid h-8 w-8 place-items-center rounded-lg text-white/60 hover:bg-white/10"
              aria-label="بستن منو"
            >
              <X className="h-4.5 w-4.5" />
            </button>
            <SidebarBody userName={userName} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      ) : null}

      {/* Content column */}
      <div className="flex min-h-screen flex-col md:ms-60">
        {/* Mobile topbar */}
        <div className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-cloud-200 bg-white/90 px-4 backdrop-blur md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-cloud-300 text-navy-800"
            aria-label="باز کردن منو"
          >
            <Menu className="h-4.5 w-4.5" />
          </button>
          <span className="text-[13px] font-extrabold text-navy-900">پنل مدیریت</span>
          <span className="h-9 w-9" aria-hidden="true" />
        </div>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>

        <footer className="px-6 pb-5 text-center text-[11px] text-ink-400">
          پنل مدیریت رایان حساب — {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}
