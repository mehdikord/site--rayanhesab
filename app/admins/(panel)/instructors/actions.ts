'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/app/lib/prisma';
import { requireAdmin } from '@/app/admins/lib/auth';
import type { ActionResult } from '@/app/admins/_components/Confirm';

function toBigInt(v: string | FormDataEntryValue | null): bigint | undefined {
  const s = String(v ?? '').trim();
  return s === '' ? undefined : BigInt(s);
}
function clean(s: string | FormDataEntryValue | null): string | null {
  const t = String(s ?? '').trim();
  return t === '' ? null : t;
}

function touch() {
  revalidatePath('/admins/instructors');
  revalidatePath('/');
  revalidatePath('/courses');
}

export async function upsertInstructor(fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = toBigInt(fd.get('id'));

  const name = clean(fd.get('name'));
  if (!name) return { ok: false, message: 'نام استاد الزامی است.' };

  const data = {
    name,
    title: clean(fd.get('title')),
    bio: clean(fd.get('bio')),
    avatar: clean(fd.get('avatar')),
    isActive: fd.get('isActive') === '1',
  };

  if (id) {
    await prisma.instructor.update({ where: { id }, data });
  } else {
    await prisma.instructor.create({ data });
  }

  touch();
  return { ok: true };
}

export async function deleteInstructor(instructorId: string): Promise<ActionResult> {
  await requireAdmin();
  const usage = await prisma.course.count({ where: { instructorId: BigInt(instructorId) } });
  if (usage > 0) {
    return {
      ok: false,
      message: `این استاد روی ${usage.toLocaleString('fa-IR')} دوره تنظیم است؛ ابتدا دوره‌ها را ویرایش کنید.`,
    };
  }
  await prisma.instructor.delete({ where: { id: BigInt(instructorId) } });
  touch();
  return { ok: true };
}
