'use client';

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/app/lib/utils';

export function Accordion({
  items,
  onDark,
  className,
}: {
  items: { q: string; a: string }[];
  onDark?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className={cn('divide-y', onDark ? 'divide-white/10' : 'divide-cloud-300', className)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className={cn(
                'flex w-full items-center justify-between gap-4 py-5 text-right transition-colors',
                onDark ? 'text-white hover:text-brand-200' : 'text-navy-900 hover:text-brand-600',
              )}
            >
              <span className="text-[15px] font-bold leading-7 sm:text-base">{item.q}</span>
              <span
                className={cn(
                  'grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-colors',
                  onDark ? 'border-white/20 text-white' : 'border-cloud-300 text-ink-500',
                  isOpen && (onDark ? 'bg-white text-navy-900' : 'bg-navy-900 text-white border-navy-900'),
                )}
              >
                {isOpen ? <Minus className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
              </span>
            </button>
            <div
              className={cn(
                'grid transition-all duration-400 ease-out',
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
              )}
            >
              <div className="overflow-hidden">
                <p className={cn('pb-6 text-[14px] leading-8', onDark ? 'text-white/60' : 'text-ink-500')}>{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
