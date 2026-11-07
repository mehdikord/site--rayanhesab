'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/app/lib/prisma';
import { parseLocalInputValue } from '@/app/lib/datetime';
import { requireAdmin } from '@/app/admins/lib/auth';
import type { ActionResult } from '@/app/admins/_components/Confirm';
import { Prisma, type ArticleStatus } from '@prisma/client';

function toBigInt(v: string | FormDataEntryValue | null): bigint | undefined {
  const s = String(v ?? '').trim();
  return s === '' ? undefined : BigInt(s);
}
function toOptInt(v: string | FormDataEntryValue | null): number | null {
  const s = String(v ?? '').trim();
  if (s === '') return null;
  const n = Number(s);
  return Number.isNaN(n) ? null : Math.max(0, Math.trunc(n));
}
function clean(s: string | FormDataEntryValue | null): string | null {
  const t = String(s ?? '').trim();
  return t === '' ? null : t;
}
/** datetime-local value (business timezone) → Date. */
function toDateTime(v: string | FormDataEntryValue | null): Date | null {
  return parseLocalInputValue(String(v ?? ''));
}

function touch() {
  revalidatePath('/admins/articles');
  revalidatePath('/');
  revalidatePath('/articles');
  revalidatePath('/articles/[slug]', 'layout');
}

export async function upsertArticle(fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = toBigInt(fd.get('id'));

  const slug = String(fd.get('slug') ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\p{L}\p{N}-]/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  const title = clean(fd.get('title'));
  if (!slug || !title) return { ok: false, message: 'Slug و عنوان الزامی است.' };

  const statusRaw = String(fd.get('status') ?? 'draft');
  const status: ArticleStatus = (['draft', 'published', 'archived'] as const).includes(statusRaw as ArticleStatus)
    ? (statusRaw as ArticleStatus)
    : 'draft';
  const data = {
    slug,
    title,
    articleCategoryId: toBigInt(fd.get('articleCategoryId')) ?? null,
    adminId: toBigInt(fd.get('adminId')) ?? null,
    excerpt: clean(fd.get('excerpt')),
    body: clean(fd.get('body')),
    image: clean(fd.get('image')),
    authorName: clean(fd.get('authorName')),
    authorRole: clean(fd.get('authorRole')),
    readingTime: toOptInt(fd.get('readingTime')),
    status,
    publishedAt:
      toDateTime(fd.get('publishedAt')) ?? (status === 'published' ? new Date() : null),
    metaTitle: clean(fd.get('metaTitle')),
    metaDescription: clean(fd.get('metaDescription')),
  };

  try {
    if (id) {
      await prisma.article.update({ where: { id }, data });
    } else {
      await prisma.article.create({ data });
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

export async function deleteArticle(articleId: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.article.delete({ where: { id: BigInt(articleId) } });
  touch();
  return { ok: true };
}

export async function saveArticleRelated(fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const articleId = toBigInt(fd.get('articleId'));
  if (!articleId) return { ok: false, message: 'مقاله یافت نشد.' };

  const wanted: bigint[] = [];
  for (const [key, value] of fd.entries()) {
    if (key.startsWith('related:') && value === '1') wanted.push(BigInt(key.slice(8)));
  }

  await prisma.$transaction([
    prisma.articleRelated.deleteMany({ where: { articleId } }),
    prisma.articleRelated.createMany({
      data: wanted
        .filter((rid) => rid !== articleId)
        .map((rid) => ({ articleId, relatedArticleId: rid })),
    }),
  ]);
  touch();
  return { ok: true };
}
