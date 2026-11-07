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

function slugify(v: string): string {
  return v
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\p{L}\p{N}-]/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function duplicateSlugError(e: unknown, field: string): string | null {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
    return `این ${field} تکراری است؛ مقدار دیگری انتخاب کنید.`;
  }
  return null;
}

/* ───────────────────────── Article categories ───────────────────────── */

export async function upsertArticleCategory(fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = toBigInt(fd.get('id'));

  const name = clean(fd.get('name'));
  if (!name) return { ok: false, message: 'نام الزامی است.' };
  const slug = slugify(String(fd.get('slug') ?? name));

  const data = {
    name,
    slug,
    description: clean(fd.get('description')),
    sortOrder: toInt(fd.get('sortOrder')),
    isActive: fd.get('isActive') === '1',
  };

  try {
    if (id) {
      await prisma.articleCategory.update({ where: { id }, data });
    } else {
      await prisma.articleCategory.create({ data });
    }
  } catch (e) {
    const dup = duplicateSlugError(e, 'slug');
    if (dup) return { ok: false, message: dup };
    throw e;
  }

  revalidatePath('/admins/categories');
  revalidatePath('/articles');
  return { ok: true };
}

export async function deleteArticleCategory(categoryId: string): Promise<ActionResult> {
  await requireAdmin();
  const usage = await prisma.article.count({ where: { articleCategoryId: BigInt(categoryId) } });
  if (usage > 0) {
    return { ok: false, message: `این دسته روی ${usage.toLocaleString('fa-IR')} مقاله استفاده شده است؛ ابتدا مقالات را به دستهٔ دیگری منتقل کنید.` };
  }
  await prisma.articleCategory.delete({ where: { id: BigInt(categoryId) } });
  revalidatePath('/admins/categories');
  revalidatePath('/articles');
  return { ok: true };
}

/* ───────────────────────── Course categories ───────────────────────── */

export async function upsertCourseCategory(fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = toBigInt(fd.get('id'));

  const name = clean(fd.get('name'));
  if (!name) return { ok: false, message: 'نام الزامی است.' };
  const slug = slugify(String(fd.get('slug') ?? name));

  const data = {
    name,
    slug,
    description: clean(fd.get('description')),
    sortOrder: toInt(fd.get('sortOrder')),
    isActive: fd.get('isActive') === '1',
  };

  try {
    if (id) {
      await prisma.courseCategory.update({ where: { id }, data });
    } else {
      await prisma.courseCategory.create({ data });
    }
  } catch (e) {
    const dup = duplicateSlugError(e, 'slug');
    if (dup) return { ok: false, message: dup };
    throw e;
  }

  revalidatePath('/admins/categories');
  revalidatePath('/courses');
  return { ok: true };
}

export async function deleteCourseCategory(categoryId: string): Promise<ActionResult> {
  await requireAdmin();
  const usage = await prisma.course.count({ where: { courseCategoryId: BigInt(categoryId) } });
  if (usage > 0) {
    return { ok: false, message: `این دسته روی ${usage.toLocaleString('fa-IR')} دوره استفاده شده است؛ ابتدا دوره‌ها را به دستهٔ دیگری منتقل کنید.` };
  }
  await prisma.courseCategory.delete({ where: { id: BigInt(categoryId) } });
  revalidatePath('/admins/categories');
  revalidatePath('/courses');
  return { ok: true };
}

/* ───────────────────────── Tags ───────────────────────── */

export async function upsertTag(fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = toBigInt(fd.get('id'));

  const name = clean(fd.get('name'));
  if (!name) return { ok: false, message: 'نام الزامی است.' };
  const slug = slugify(String(fd.get('slug') ?? name));

  const data = { name, slug };

  try {
    if (id) {
      await prisma.tag.update({ where: { id }, data });
    } else {
      await prisma.tag.create({ data });
    }
  } catch (e) {
    const dup = duplicateSlugError(e, 'slug');
    if (dup) return { ok: false, message: dup };
    throw e;
  }

  revalidatePath('/admins/categories');
  return { ok: true };
}

export async function deleteTag(tagId: string): Promise<ActionResult> {
  await requireAdmin();
  const usage = await prisma.courseTag.count({ where: { tagId: BigInt(tagId) } });
  if (usage > 0) {
    return { ok: false, message: `این برچسب روی ${usage.toLocaleString('fa-IR')} دوره استفاده شده است؛ ابتدا از دوره‌ها حذفش کنید.` };
  }
  await prisma.tag.delete({ where: { id: BigInt(tagId) } });
  revalidatePath('/admins/categories');
  revalidatePath('/courses');
  return { ok: true };
}
