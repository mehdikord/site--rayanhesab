import type { NextRequest } from 'next/server';
import { mimeForExt, readStored } from '@/app/lib/storage';

/** Public uploaded images (written by the admin panel's upload endpoint). */
export async function GET(_req: NextRequest, ctx: RouteContext<'/uploads/[...path]'>) {
  const { path } = await ctx.params;
  const file = await readStored('public', path.join('/'));
  if (!file) return new Response('Not found', { status: 404 });

  return new Response(new Uint8Array(file.data), {
    headers: {
      'Content-Type': mimeForExt(file.ext),
      'Content-Length': String(file.size),
      // File names are random and never reused, so they can be cached forever.
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
