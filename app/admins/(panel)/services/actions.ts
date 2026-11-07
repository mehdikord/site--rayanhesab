'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/app/lib/prisma';
import { requireAdmin } from '@/app/admins/lib/auth';
import type { ActionResult } from '@/app/admins/_components/Confirm';
import { Prisma, type ServiceFeatureType } from '@prisma/client';

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

/* ───────────────────────── Main record ───────────────────────── */

export async function upsertService(fd: FormData): Promise<ActionResult> {
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
  if (!slug || !title) {
    return { ok: false, message: 'Slug و عنوان الزامی است.' };
  }

  const data = {
    slug,
    title,
    shortTitle: clean(fd.get('shortTitle')),
    excerpt: clean(fd.get('excerpt')),
    icon: clean(fd.get('icon')),
    image: clean(fd.get('image')),
    accent: clean(fd.get('accent')),
    sortOrder: toInt(fd.get('sortOrder')),
    isActive: fd.get('isActive') === '1',
    metaTitle: clean(fd.get('metaTitle')),
    metaDescription: clean(fd.get('metaDescription')),
  };

  try {
    if (id) {
      await prisma.service.update({ where: { id }, data });
    } else {
      await prisma.service.create({ data });
    }
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { ok: false, message: 'این slug تکراری است؛ یک slug دیگر انتخاب کنید.' };
    }
    throw e;
  }

  revalidatePath('/admins/services');
  revalidatePath('/');
  revalidatePath('/services');
  revalidatePath('/services/[slug]', 'layout');
  return { ok: true, message: 'ذخیره شد.' };
}

export async function deleteService(serviceId: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.service.delete({ where: { id: BigInt(serviceId) } });
  revalidatePath('/admins/services');
  revalidatePath('/');
  revalidatePath('/services');
  revalidatePath('/services/[slug]', 'layout');
  return { ok: true };
}

/* ───────────────────────── Nested: features ───────────────────────── */

const FEATURE_TYPES: ServiceFeatureType[] = ['problem', 'scope', 'benefit', 'audience'];

export async function upsertServiceFeature(fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = toBigInt(fd.get('id'));
  const serviceId = toBigInt(fd.get('serviceId'));
  if (!serviceId) return { ok: false, message: 'خدمات یافت نشد.' };

  const type = String(fd.get('type') ?? '') as ServiceFeatureType;
  if (!FEATURE_TYPES.includes(type)) return { ok: false, message: 'نوع انتخاب‌شده معتبر نیست.' };
  const title = clean(fd.get('title'));
  if (!title) return { ok: false, message: 'عنوان الزامی است.' };

  const data = {
    title,
    description: clean(fd.get('description')),
    sortOrder: toInt(fd.get('sortOrder')),
  };

  if (id) {
    await prisma.serviceFeature.update({ where: { id }, data: { ...data, type } });
  } else {
    await prisma.serviceFeature.create({ data: { ...data, type, serviceId } });
  }

  revalidatePath('/admins/services');
  return { ok: true };
}

export async function deleteServiceFeature(rowId: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.serviceFeature.delete({ where: { id: BigInt(rowId) } });
  revalidatePath('/admins/services');
  return { ok: true };
}

/* ───────────────────────── Nested: faqs ───────────────────────── */

export async function upsertServiceFaq(fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = toBigInt(fd.get('id'));
  const serviceId = toBigInt(fd.get('serviceId'));
  if (!serviceId) return { ok: false, message: 'خدمات یافت نشد.' };

  const question = clean(fd.get('question'));
  const answer = clean(fd.get('answer'));
  if (!question || !answer) return { ok: false, message: 'سؤال و پاسخ الزامی است.' };

  if (id) {
    await prisma.serviceFaq.update({
      where: { id },
      data: { question, answer, sortOrder: toInt(fd.get('sortOrder')) },
    });
  } else {
    await prisma.serviceFaq.create({
      data: { serviceId, question, answer, sortOrder: toInt(fd.get('sortOrder')) },
    });
  }

  revalidatePath('/admins/services');
  return { ok: true };
}

export async function deleteServiceFaq(rowId: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.serviceFaq.delete({ where: { id: BigInt(rowId) } });
  revalidatePath('/admins/services');
  return { ok: true };
}

/* ───────────────────────── Nested: process steps ───────────────────────── */

export async function upsertServiceStep(fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = toBigInt(fd.get('id'));
  const serviceId = toBigInt(fd.get('serviceId'));
  if (!serviceId) return { ok: false, message: 'خدمات یافت نشد.' };

  const title = clean(fd.get('title'));
  if (!title) return { ok: false, message: 'عنوان الزامی است.' };

  const data = {
    title,
    description: clean(fd.get('description')),
    sortOrder: toInt(fd.get('sortOrder')),
  };

  if (id) {
    await prisma.serviceProcessStep.update({ where: { id }, data });
  } else {
    await prisma.serviceProcessStep.create({ data: { ...data, serviceId } });
  }

  revalidatePath('/admins/services');
  return { ok: true };
}

export async function deleteServiceStep(rowId: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.serviceProcessStep.delete({ where: { id: BigInt(rowId) } });
  revalidatePath('/admins/services');
  return { ok: true };
}

/* ───────────────────────── Nested: related services ───────────────────────── */

export async function saveServiceRelated(fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const serviceId = toBigInt(fd.get('serviceId'));
  if (!serviceId) return { ok: false, message: 'خدمات یافت نشد.' };

  const wanted: bigint[] = [];
  for (const [key, value] of fd.entries()) {
    if (key.startsWith('related:') && value === '1') {
      wanted.push(BigInt(key.slice('related:'.length)));
    }
  }

  await prisma.$transaction([
    prisma.serviceRelated.deleteMany({ where: { serviceId } }),
    prisma.serviceRelated.createMany({
      data: wanted
        .filter((rid) => rid !== serviceId)
        .map((rid) => ({ serviceId, relatedServiceId: rid })),
    }),
  ]);

  revalidatePath('/admins/services');
  return { ok: true };
}
