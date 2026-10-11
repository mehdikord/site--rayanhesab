import { cn } from '@/app/lib/utils';

export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('mx-auto w-full max-w-7xl px-5 sm:px-8', className)}>{children}</div>;
}

export function Eyebrow({ children, onDark, className }: { children: React.ReactNode; onDark?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 text-[13px] font-semibold tracking-wide',
        onDark ? 'text-brand-300' : 'text-brand-600',
        className,
      )}
    >
      <span className={cn('h-[6px] w-[6px] rounded-full', onDark ? 'bg-brand-400' : 'bg-brand-500')} />
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  onDark,
  align = 'start',
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  onDark?: boolean;
  align?: 'start' | 'center';
  className?: string;
}) {
  return (
    <div className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center', className)}>
      {eyebrow && <Eyebrow onDark={onDark}>{eyebrow}</Eyebrow>}
      <h2
        className={cn(
          'mt-4 text-balance text-3xl font-extrabold leading-[1.35] sm:text-4xl lg:text-[42px] lg:leading-[1.3]',
          onDark ? 'text-white' : 'text-navy-900',
        )}
      >
        {title}
      </h2>
      {description && (
        <p className={cn('mt-5 text-[15px] leading-8 sm:text-base', onDark ? 'text-brand-200/80' : 'text-ink-500')}>
          {description}
        </p>
      )}
    </div>
  );
}

export function Section({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn('py-16 sm:py-20 lg:py-28', className)}>
      {children}
    </section>
  );
}
