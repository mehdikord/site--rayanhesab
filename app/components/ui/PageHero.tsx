import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/app/lib/utils';

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="مسیر صفحه" className="flex flex-wrap items-center gap-2 text-[13px]">
      <Link href="/" className="text-white/55 transition-colors hover:text-white">
        خانه
      </Link>
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="flex items-center gap-2">
          <ChevronLeft className="h-3.5 w-3.5 text-white/30" aria-hidden="true" />
          {item.href ? (
            <Link href={item.href} className="text-white/55 transition-colors hover:text-white">
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-white">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  breadcrumbs,
  image,
  children,
  compact,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  image?: string;
  children?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <section className="relative overflow-hidden bg-navy-950 pt-[68px] text-white">
      {image && (
        <div className="absolute inset-0" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" className="h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-l from-navy-950 via-navy-950/85 to-navy-950/70" />
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 ledger-grid opacity-50" aria-hidden="true" />
      <div className="pointer-events-none absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-brand-500/25 blur-[120px]" aria-hidden="true" />
      <div
        className={cn(
          'relative mx-auto w-full max-w-7xl px-5 sm:px-8',
          compact ? 'py-14 sm:py-16' : 'py-16 sm:py-24 lg:py-28',
        )}
      >
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
        {eyebrow && (
          <p className="mt-6 inline-flex items-center gap-2 text-[13px] font-semibold text-brand-300">
            <span className="h-[6px] w-[6px] rounded-full bg-brand-400" />
            {eyebrow}
          </p>
        )}
        <h1 className="mt-4 max-w-4xl text-balance text-3xl font-black leading-[1.35] sm:text-4xl lg:text-[52px] lg:leading-[1.25]">
          {title}
        </h1>
        {description && (
          <p className="mt-6 max-w-2xl text-[15px] leading-9 text-white/65 sm:text-base">{description}</p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
