'use client';

import { useEffect, useRef } from 'react';

export function SpotlightCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(hover: none)').matches) return;
    function handleMove(e: MouseEvent) {
      const rect = el!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      el!.style.setProperty('--mx', `${x}px`);
      el!.style.setProperty('--my', `${y}px`);
    }
    el.addEventListener('mousemove', handleMove);
    return () => el.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div
      ref={ref}
      className={
        'group relative overflow-hidden rounded-[28px] border border-cloud-300 bg-white shadow-card transition-[box-shadow,transform,border-color] duration-500 hover:shadow-lift hover:border-brand-200 hover:-translate-y-1 ' +
        (className ?? '')
      }
      style={{ ['--mx' as string]: '50%', ['--my' as string]: '50%' } as React.CSSProperties}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(520px circle at var(--mx) var(--my), rgba(79,140,255,0.12), transparent 66%)',
        }}
        aria-hidden="true"
      />
      {children}
    </div>
  );
}
