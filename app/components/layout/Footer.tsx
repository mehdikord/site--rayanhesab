import Link from 'next/link';
import Image from 'next/image';
import { Mail, MapPin, Phone, Send, ArrowUpLeft } from 'lucide-react';
import type { SiteSettings } from '@/app/lib/site-data';
import type { Service } from '@/app/types';
import { Container } from '@/app/components/ui/Section';

const quickLinks = [
  { label: 'دوره‌های آموزشی', href: '/courses' },
  { label: 'جذب و استخدام', href: '/recruitment' },
  { label: 'مقالات مالی', href: '/articles' },
  { label: 'تیم ما', href: '/team' },
  { label: 'درباره ما', href: '/about' },
  { label: 'تماس با ما', href: '/contact' },
];

export function Footer({
  settings,
  services,
}: {
  settings: SiteSettings;
  services: Service[];
}) {
  const year = new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(new Date()).replace(/[^۰-۹0-9]/g, '');

  const socials = [
    settings.telegram && { href: settings.telegram, label: 'تلگرام' },
    settings.whatsapp && { href: settings.whatsapp, label: 'واتساپ' },
    settings.instagram && { href: settings.instagram, label: 'اینستاگرام' },
    settings.linkedin && { href: settings.linkedin, label: 'لینکدین' },
    settings.email && { href: `mailto:${settings.email}`, label: 'ایمیل' },
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <footer className="relative overflow-hidden bg-navy-950 text-white">
      <div className="pointer-events-none absolute inset-0 ledger-grid opacity-40" aria-hidden="true" />
      <div className="pointer-events-none absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-brand-500/20 blur-[130px]" aria-hidden="true" />

      <Container className="relative py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt={`لوگوی ${settings.siteName}`}
                width={44}
                height={44}
                className="h-11 w-11 object-contain"
              />
              <span className="flex flex-col leading-none">
                <span className="text-[18px] font-extrabold">{settings.siteName}</span>
                <span className="mt-1 text-[10px] font-semibold tracking-[0.32em] text-white/50" dir="ltr">RAYAN</span>
              </span>
            </div>
            <p className="mt-5 max-w-sm text-[14px] leading-8 text-white/60">{settings.footerAbout}</p>
            {socials.length > 0 && (
              <div className="mt-6 flex items-center gap-2">
                {socials.map(({ href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith('mailto') ? undefined : '_blank'}
                    rel={href.startsWith('mailto') ? undefined : 'noreferrer'}
                    aria-label={label}
                    className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white hover:text-navy-900"
                  >
                    <Send className="h-[18px] w-[18px]" aria-hidden="true" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-[14px] font-bold text-white">خدمات</h3>
            <ul className="mt-5 space-y-3">
              {services.slice(0, 6).map((s) => (
                <li key={s.slug}>
                  <Link href={`/services/${s.slug}`} className="text-[13.5px] text-white/60 transition-colors hover:text-white">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-[14px] font-bold text-white">دسترسی سریع</h3>
            <ul className="mt-5 space-y-3">
              {quickLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[13.5px] text-white/60 transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-[14px] font-bold text-white">تماس با ما</h3>
            <ul className="mt-5 space-y-4 text-[13.5px] text-white/60">
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" aria-hidden="true" />
                <a href={settings.phoneLink} className="ltr transition-colors hover:text-white">
                  {settings.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" aria-hidden="true" />
                <a href={`mailto:${settings.email}`} className="ltr transition-colors hover:text-white">
                  {settings.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" aria-hidden="true" />
                <span>{settings.address}</span>
              </li>
            </ul>
            <Link
              href="/consultation"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[13px] font-bold text-navy-900 transition-transform hover:-translate-y-0.5"
            >
              درخواست مشاوره
              <ArrowUpLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-7 text-[12.5px] text-white/45 sm:flex-row">
          <p>© {year} {settings.siteName}. تمامی حقوق محفوظ است.</p>
          <div className="flex items-center gap-5">
            <Link href="/about" className="transition-colors hover:text-white">حریم خصوصی</Link>
            <Link href="/contact" className="transition-colors hover:text-white">قوانین</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
