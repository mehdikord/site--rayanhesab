import { cn } from '@/app/lib/utils';

export function Badge({
  children,
  tone = 'brand',
  className,
}: {
  children: React.ReactNode;
  tone?: 'brand' | 'navy' | 'gold' | 'muted' | 'success';
  className?: string;
}) {
  const tones: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-700 border-brand-100',
    navy: 'bg-navy-900 text-white border-navy-900',
    gold: 'bg-gold-500/15 text-[#8a6d21] border-gold-500/30',
    muted: 'bg-cloud-100 text-ink-500 border-cloud-300',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-bold',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
