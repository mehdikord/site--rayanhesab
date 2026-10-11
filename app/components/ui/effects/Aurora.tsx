/* ReactBits-inspired "Aurora" background — pure CSS, GPU-light, RTL-agnostic */
export function Aurora({ className }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ''}`} aria-hidden="true">
      <div className="absolute -top-1/3 right-[-10%] h-[70vh] w-[70vh] rounded-full bg-brand-500/30 blur-[120px] animate-blob" />
      <div
        className="absolute bottom-[-20%] left-[-10%] h-[60vh] w-[60vh] rounded-full bg-brand-400/20 blur-[120px] animate-blob"
        style={{ animationDelay: '-6s' }}
      />
      <div
        className="absolute top-[10%] left-[30%] h-[45vh] w-[45vh] rounded-full bg-indigo-400/20 blur-[130px] animate-blob"
        style={{ animationDelay: '-12s' }}
      />
    </div>
  );
}
