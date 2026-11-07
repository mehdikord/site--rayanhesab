import { headers } from 'next/headers';

/**
 * Absolute base URL of the site, used for gateway callback URLs.
 * In production the configured URL wins (never trust the Host header there);
 * otherwise it is derived from the incoming request.
 */
export async function appBaseUrl(): Promise<string> {
  const configured = process.env.APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (configured && process.env.NODE_ENV === 'production') return configured.replace(/\/+$/, '');

  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  if (host) {
    const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
    return `${proto}://${host}`;
  }
  return (configured ?? 'http://localhost:3000').replace(/\/+$/, '');
}
