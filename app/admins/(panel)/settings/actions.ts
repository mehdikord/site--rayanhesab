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

function touch() {
  revalidatePath('/admins/settings');
  revalidatePath('/');
}

/** Add a new setting key or edit an existing one (group, key, value). */
export async function upsertSetting(fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = toBigInt(fd.get('id'));

  const key = String(fd.get('key') ?? '').trim();
  if (!key) return { ok: false, message: 'کلید الزامی است.' };
  const group = String(fd.get('group') ?? 'general').trim() || 'general';
  const value = String(fd.get('value') ?? '').trim() || null;

  try {
    if (id) {
      await prisma.setting.update({ where: { id }, data: { group, key, value } });
    } else {
      await prisma.setting.create({ data: { group, key, value } });
    }
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { ok: false, message: 'این کلید قبلاً ثبت شده است.' };
    }
    throw e;
  }

  touch();
  return { ok: true };
}

export async function deleteSetting(settingId: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.setting.delete({ where: { id: BigInt(settingId) } });
  touch();
  return { ok: true };
}
