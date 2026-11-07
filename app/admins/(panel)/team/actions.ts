'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/app/lib/prisma';
import { requireAdmin } from '@/app/admins/lib/auth';
import type { ActionResult } from '@/app/admins/_components/Confirm';
import { Prisma } from '@prisma/client';

function toBigInt(v: string | FormDataEntryValue | null): bigint | undefined {
  const s = String(v ?? '').trim();
  return s === '' ? undefined : BigInt(s);
}
function toInt(v: string | FormDataEntryValue | null): number {
  const s = String(v ?? '').trim();
  if (s === '') return 0;
  const n = Number(s);
  return Number.isNaN(n) ? 0 : Math.max(0, Math.trunc(n));
}
function clean(s: string | FormDataEntryValue | null): string | null {
  const t = String(s ?? '').trim();
  return t === '' ? null : t;
}

function touch() {
  revalidatePath('/admins/team');
  revalidatePath('/');
  revalidatePath('/team');
}

export async function upsertTeamMember(fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = toBigInt(fd.get('id'));

  const slug = String(fd.get('slug') ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\p{L}\p{N}-]/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  const name = clean(fd.get('name'));
  const role = clean(fd.get('role'));
  if (!slug || !name || !role) {
    return { ok: false, message: 'Slug، نام و نقش الزامی است.' };
  }

  const data = {
    slug,
    name,
    role,
    expertise: clean(fd.get('expertise')),
    image: clean(fd.get('image')),
    bio: clean(fd.get('bio')),
    sortOrder: toInt(fd.get('sortOrder')),
    isActive: fd.get('isActive') === '1',
  };

  try {
    if (id) {
      await prisma.teamMember.update({ where: { id }, data });
    } else {
      await prisma.teamMember.create({ data });
    }
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { ok: false, message: 'این slug تکراری است.' };
    }
    throw e;
  }

  touch();
  return { ok: true };
}

export async function deleteTeamMember(memberId: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.teamMember.delete({ where: { id: BigInt(memberId) } });
  touch();
  return { ok: true };
}
