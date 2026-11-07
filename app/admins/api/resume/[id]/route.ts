import type { NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getAdminSession } from '@/app/admins/lib/auth';
import { mimeForExt, readStored } from '@/app/lib/storage';

/** Download a talent application's resume (admins only; resumes are private). */
export async function GET(_req: NextRequest, ctx: RouteContext<'/admins/api/resume/[id]'>) {
  const session = await getAdminSession();
  if (!session) return new Response('Unauthorized', { status: 401 });

  const { id } = await ctx.params;
  if (!/^\d+$/.test(id)) return new Response('Not found', { status: 404 });

  const app = await prisma.talentApplication.findUnique({
    where: { id: BigInt(id) },
    select: { fullName: true, resumePath: true },
  });
  if (!app?.resumePath) return new Response('Not found', { status: 404 });

  const file = await readStored('private', app.resumePath);
  if (!file) return new Response('Not found', { status: 404 });

  const filename = `resume-${id}.${file.ext}`;
  return new Response(new Uint8Array(file.data), {
    headers: {
      'Content-Type': mimeForExt(file.ext),
      'Content-Length': String(file.size),
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
