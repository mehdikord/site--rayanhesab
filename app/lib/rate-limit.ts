import { headers } from 'next/headers';

/**
 * Fixed-window, in-memory rate limiter. It is per server process, which is
 * enough to blunt brute-force and form spam on a single-instance deployment;
 * behind several instances, move this to a shared store such as Redis.
 */
const globalForLimiter = globalThis as unknown as {
  rateBuckets?: Map<string, { count: number; resetAt: number }>;
};
const buckets = (globalForLimiter.rateBuckets ??= new Map());

/** Returns true when the action is allowed, false when the limit is reached. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  if (buckets.size > 10_000) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
  }
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

/** Forget a key, e.g. after a successful login. */
export function resetRateLimit(key: string): void {
  buckets.delete(key);
}

/** Best-effort client IP from proxy headers (trimmed to the DB column size). */
export async function clientIp(): Promise<string | null> {
  try {
    const h = await headers();
    const ip =
      h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      h.get('x-real-ip') ||
      h.get('cf-connecting-ip') ||
      null;
    return ip ? ip.slice(0, 45) : null;
  } catch {
    return null;
  }
}
