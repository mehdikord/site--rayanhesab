/**
 * Conversions between stored instants and `<input type="datetime-local">`
 * values. Wall-clock values are always interpreted in the business timezone
 * (Asia/Tehran by default), so results do not depend on the timezone of the
 * admin's browser or of the server.
 */
export const APP_TIMEZONE = process.env.NEXT_PUBLIC_APP_TIMEZONE || 'Asia/Tehran';

function wallParts(d: Date): Record<string, number> {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(d);
  const out: Record<string, number> = {};
  for (const p of parts) if (p.type !== 'literal') out[p.type] = Number(p.value);
  return out;
}

/** Milliseconds the business timezone is ahead of UTC at instant `d`. */
function offsetAt(d: Date): number {
  const w = wallParts(d);
  const asUtc = Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute, w.second);
  return asUtc - Math.floor(d.getTime() / 1000) * 1000;
}

/** ISO/Date → "YYYY-MM-DDTHH:mm" in the business timezone ('' for empty). */
export function toLocalInputValue(value: string | Date | null | undefined): string {
  if (!value) return '';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '';
  const w = wallParts(d);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${w.year}-${p(w.month)}-${p(w.day)}T${p(w.hour)}:${p(w.minute)}`;
}

/**
 * "YYYY-MM-DDTHH:mm" (or "YYYY-MM-DD", read as end of that day) in the
 * business timezone → Date. Returns null for empty or invalid input.
 */
export function parseLocalInputValue(value: string | null | undefined): Date | null {
  const s = String(value ?? '').trim();
  if (!s) return null;
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (!m) {
    // Already carries a zone (e.g. a full ISO string): trust it.
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const [, y, mo, da, h, mi, se] = m;
  const dateOnly = h === undefined;
  const guess = Date.UTC(
    Number(y),
    Number(mo) - 1,
    Number(da),
    dateOnly ? 23 : Number(h),
    dateOnly ? 59 : Number(mi),
    dateOnly ? 59 : Number(se ?? 0),
  );
  // Two passes settle the offset across DST boundaries.
  let t = guess - offsetAt(new Date(guess));
  t = guess - offsetAt(new Date(t));
  const d = new Date(t);
  return Number.isNaN(d.getTime()) ? null : d;
}
