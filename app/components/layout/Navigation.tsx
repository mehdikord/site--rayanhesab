'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, Phone, Mail, ArrowUpLeft } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { ButtonLink } from '@/app/components/ui/Button';

const mainNav = [
  { label: 'خدمات', href: '/services', hasMenu: true },
  { label: 'دوره‌ها', href: '/courses' },
  { label: 'جذب نیرو', href: '/recruitment' },
  { label: 'مقالات', href: '/articles' },
  { label: 'درباره ما', href: '/about' },
  { label: 'تماس', href: '/contact' },
];

const serviceMenu = [
  { label: 'حسابداری و حسابرسی', href: '/services/accounting-auditing', desc: 'ساماندهی دفاتر و صورت‌های مالی' },
  { label: 'خدمات مالیاتی', href: '/services/tax-services', desc: 'اظهارنامه، دفاع و برنامه‌ریزی' },
  { label: 'مشاوره مالی و کسب‌وکار', href: '/services/financial-consulting', desc: 'تصمیم‌گیری مبتنی بر داده' },
  { label: 'آموزش تخصصی حسابداری', href: '/services/accounting-education', desc: 'مهارت برای بازار کار' },
  { label: 'جذب حسابدار متخصص', href: '/services/talent-matching', desc: 'تطبیق استعداد و کسب‌وکار' },
  { label: 'خدمات مالی سفارشی', href: '/services/business-financial-services', desc: 'راهکار متناسب با شما' },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isHome = pathname === '/';
  const solid = scrolled || !isHome;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const openMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMenuOpen(true);
  };
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setMenuOpen(false), 160);
  };

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-500',
          solid
            ? 'bg-white/92 backdrop-blur-xl border-b border-cloud-300/80 shadow-[0_2px_20px_-10px_rgba(16,38,74,0.35)]'
            : 'bg-transparent border-b border-white/0',
        )}
      >
        <nav className="mx-auto flex h-[68px] w-full max-w-7xl items-center justify-between gap-4 px-5 sm:px-8" aria-label="ناوبری اصلی">
          <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="رایان حساب صبا — خانه">
            <span
              className={cn(
                'grid h-10 w-10 place-items-center rounded-2xl text-[18px] font-black leading-none transition-colors',
                solid ? 'bg-navy-900 text-white' : 'bg-white text-navy-900',
              )}
            >
              ر
            </span>
            <span className="flex flex-col leading-none">
              <span className={cn('text-[17px] font-extrabold tracking-tight transition-colors', solid ? 'text-navy-900' : 'text-white')}>
                رایان حساب صبا
              </span>
              <span className={cn('mt-1 text-[10px] font-semibold tracking-[0.32em] uppercase transition-colors', solid ? 'text-ink-400' : 'text-white/60')} dir="ltr">
                RAYAN
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {mainNav.map((item) =>
              item.hasMenu ? (
                <div key={item.href} className="relative" onMouseEnter={openMenu} onMouseLeave={scheduleClose}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-1 rounded-full px-4 py-2 text-[14px] font-semibold transition-colors',
                      solid ? 'text-ink-700 hover:bg-cloud-100 hover:text-brand-600' : 'text-white/90 hover:bg-white/10 hover:text-white',
                    )}
                    aria-haspopup="true"
                    aria-expanded={menuOpen}
                  >
                    {item.label}
                    <ChevronDown className={cn('h-4 w-4 transition-transform', menuOpen && 'rotate-180')} aria-hidden="true" />
                  </Link>
                  <div
                    className={cn(
                      'absolute right-1/2 top-full translate-x-1/2 pt-3 transition-all duration-200',
                      menuOpen ? 'visible opacity-100 translate-y-0' : 'invisible -translate-y-2 opacity-0',
                    )}
                  >
                    <div className="w-[620px] overflow-hidden rounded-[24px] border border-cloud-300 bg-white p-3 shadow-lift">
                      <div className="grid grid-cols-2 gap-1">
                        {serviceMenu.map((s) => (
                          <Link
                            key={s.href}
                            href={s.href}
                            className="group flex items-start gap-3 rounded-2xl p-3 transition-colors hover:bg-cloud-100"
                          >
                            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                              <ArrowUpLeft className="h-4 w-4" aria-hidden="true" />
                            </span>
                            <span className="flex flex-col">
                              <span className="text-[14px] font-bold text-navy-900">{s.label}</span>
                              <span className="mt-0.5 text-[12px] text-ink-500">{s.desc}</span>
                            </span>
                          </Link>
                        ))}
                      </div>
                      <Link
                        href="/services"
                        className="mt-1 flex items-center justify-between rounded-2xl bg-navy-900 px-5 py-3 text-[13px] font-bold text-white"
                      >
                        مشاهده همه خدمات
                        <ArrowUpLeft className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-full px-4 py-2 text-[14px] font-semibold transition-colors',
                    pathname.startsWith(item.href)
                      ? solid
                        ? 'text-brand-600 bg-brand-50'
                        : 'text-white bg-white/15'
                      : solid
                        ? 'text-ink-700 hover:bg-cloud-100 hover:text-brand-600'
                        : 'text-white/90 hover:bg-white/10 hover:text-white',
                  )}
                >
                  {item.label}
                </Link>
              ),
            )}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <ButtonLink
              href="/consultation"
              variant={solid ? 'primary' : 'on-dark'}
              size="sm"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              مشاوره رایگان
            </ButtonLink>
          </div>

          <button
            type="button"
            className={cn(
              'grid h-11 w-11 place-items-center rounded-full transition-colors lg:hidden',
              solid ? 'text-navy-900 hover:bg-cloud-100' : 'text-white hover:bg-white/10',
            )}
            onClick={() => setMobileOpen(true)}
            aria-label="باز کردن منو"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </nav>
      </header>

      <div
        id="mobile-menu"
        className={cn(
          'fixed inset-0 z-[60] lg:hidden',
          mobileOpen ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        aria-hidden={!mobileOpen}
      >
        <div
          className={cn('absolute inset-0 bg-navy-950/60 backdrop-blur-sm transition-opacity duration-400', mobileOpen ? 'opacity-100' : 'opacity-0')}
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={cn(
            'absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col bg-white shadow-lift transition-transform duration-500 ease-out',
            mobileOpen ? 'translate-x-0' : 'translate-x-full',
          )}
          role="dialog"
          aria-modal="true"
          aria-label="منوی موبایل"
        >
          <div className="flex h-[68px] items-center justify-between border-b border-cloud-300 px-5">
            <span className="text-[16px] font-extrabold text-navy-900">منو</span>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="grid h-10 w-10 place-items-center rounded-full text-navy-900 hover:bg-cloud-100"
              aria-label="بستن منو"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-5" aria-label="ناوبری موبایل">
            <div className="space-y-1">
              {mainNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'block rounded-2xl px-4 py-3.5 text-[15px] font-semibold transition-colors',
                    pathname.startsWith(item.href) ? 'bg-brand-50 text-brand-700' : 'text-ink-700 hover:bg-cloud-100',
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="mt-5 border-t border-cloud-300 pt-5">
              <p className="px-4 pb-2 text-[12px] font-bold text-ink-400">خدمات ما</p>
              <div className="space-y-1">
                {serviceMenu.map((s) => (
                  <Link
                    key={s.href}
                    href={s.href}
                    className="block rounded-2xl px-4 py-3 text-[14px] text-ink-600 hover:bg-cloud-100"
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-5 space-y-3 border-t border-cloud-300 pt-5">
              <ButtonLink href="/consultation" variant="primary" fullWidthOnMobile size="lg">
                <Phone className="h-4 w-4" aria-hidden="true" />
                درخواست مشاوره رایگان
              </ButtonLink>
              <a href="tel:+982100000000" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-[14px] font-medium text-ink-600 hover:bg-cloud-100">
                <Phone className="h-4 w-4 text-brand-600" aria-hidden="true" />
                <span className="ltr">۰۲۱ ۰۰۰۰ ۰۰۰۰</span>
              </a>
              <a href="mailto:info@example.com" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-[14px] font-medium text-ink-600 hover:bg-cloud-100">
                <Mail className="h-4 w-4 text-brand-600" aria-hidden="true" />
                <span className="ltr">info@example.com</span>
              </a>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
