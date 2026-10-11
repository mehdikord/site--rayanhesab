import { cn } from '@/app/lib/utils';
import Link from 'next/link';

type Variant = 'primary' | 'secondary' | 'ghost' | 'on-dark';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 font-semibold tracking-tight transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 select-none';

const variantMap: Record<Variant, string> = {
  primary:
    'bg-navy-800 text-white shadow-[0_10px_30px_-14px_rgba(16,38,74,0.7)] hover:bg-navy-900 hover:shadow-[0_16px_40px_-14px_rgba(9,23,47,0.6)] active:bg-navy-950',
  secondary:
    'bg-white text-navy-800 border border-cloud-300 shadow-card hover:bg-cloud-100 hover:border-cloud-400',
  ghost: 'bg-transparent text-ink-700 hover:bg-cloud-100',
  'on-dark': 'bg-white text-navy-800 hover:bg-cloud-100 shadow-card',
};

const sizeMap: Record<Size, string> = {
  sm: 'h-9 px-4 text-[13px] rounded-full',
  md: 'h-11 px-6 text-[14px] rounded-full',
  lg: 'h-[52px] px-8 text-[15px] rounded-full',
};

function buildClass(variant: Variant, size: Size, fullWidthOnMobile?: boolean, className?: string) {
  return cn(base, variantMap[variant], sizeMap[size], fullWidthOnMobile && 'w-full sm:w-auto', className);
}

type ButtonProps = {
  variant?: Variant;
  size?: Size;
  fullWidthOnMobile?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ variant = 'primary', size = 'md', fullWidthOnMobile, className, children, ...rest }: ButtonProps) {
  return (
    <button className={buildClass(variant, size, fullWidthOnMobile, className)} {...rest}>
      {children}
    </button>
  );
}

type ButtonLinkProps = {
  variant?: Variant;
  size?: Size;
  fullWidthOnMobile?: boolean;
} & React.ComponentProps<typeof Link>;

export function ButtonLink({ variant = 'primary', size = 'md', fullWidthOnMobile, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={buildClass(variant, size, fullWidthOnMobile, className)} {...rest}>
      {children}
    </Link>
  );
}

export function ButtonRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex flex-wrap gap-3', className)}>{children}</div>;
}
