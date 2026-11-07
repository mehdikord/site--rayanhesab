'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/app/lib/prisma';
import { parseLocalInputValue } from '@/app/lib/datetime';
import { requireAdmin } from '@/app/admins/lib/auth';
import type { ActionResult } from '@/app/admins/_components/Confirm';
import { Prisma, type CourseFeatureType, type CourseStatus } from '@prisma/client';

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
  revalidatePath('/admins/courses');
  revalidatePath('/');
  revalidatePath('/courses');
  revalidatePath('/courses/[slug]', 'layout');
}

/* ───────────────────────── Main record ───────────────────────── */

export async function upsertCourse(fd: FormData): Promise<ActionResult> {
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
  const status: CourseStatus = (['draft', 'published', 'archived'] as const).includes(statusRaw as CourseStatus)
    ? (statusRaw as CourseStatus)
    : 'draft';
  // Keep the first publish date across edits; set it when first published.
  const existing = id
    ? await prisma.course.findUnique({ where: { id }, select: { publishedAt: true } })
    : null;
  const publishedAt =
    status === 'published'
      ? (toDateTime(fd.get('publishedAt')) ?? existing?.publishedAt ?? new Date())
      : (existing?.publishedAt ?? null);

  const data = {
    slug,
    title,
    excerpt: clean(fd.get('excerpt')),
    description: clean(fd.get('description')),
    image: clean(fd.get('image')),
    courseCategoryId: toBigInt(fd.get('courseCategoryId')) ?? null,
    instructorId: toBigInt(fd.get('instructorId')) ?? null,
    durationLabel: clean(fd.get('durationLabel')),
    level: clean(fd.get('level')),
    price: toInt(fd.get('price')),
    originalPrice: toOptInt(fd.get('originalPrice')),
    isFeatured: fd.get('isFeatured') === '1',
    status,
    publishedAt,
    sortOrder: toInt(fd.get('sortOrder')),
    metaTitle: clean(fd.get('metaTitle')),
    metaDescription: clean(fd.get('metaDescription')),
  };

  try {
    if (id) {
      await prisma.course.update({ where: { id }, data });
    } else {
      await prisma.course.create({ data });
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

export async function deleteCourse(courseId: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.course.delete({ where: { id: BigInt(courseId) } });
  touch();
  return { ok: true };
}

/* ───────────────────────── Chapters ───────────────────────── */

export async function upsertChapter(fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = toBigInt(fd.get('id'));
  const courseId = toBigInt(fd.get('courseId'));
  if (!courseId) return { ok: false, message: 'دوره یافت نشد.' };

  const title = clean(fd.get('title'));
  if (!title) return { ok: false, message: 'عنوان فصل الزامی است.' };

  const data = {
    title,
    description: clean(fd.get('description')),
    durationLabel: clean(fd.get('durationLabel')),
    sortOrder: toInt(fd.get('sortOrder')),
  };

  if (id) {
    await prisma.courseChapter.update({ where: { id }, data });
  } else {
    await prisma.courseChapter.create({ data: { ...data, courseId } });
  }
  revalidatePath('/admins/courses');
  return { ok: true };
}

export async function deleteChapter(chapterId: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.courseChapter.delete({ where: { id: BigInt(chapterId) } });
  revalidatePath('/admins/courses');
  return { ok: true };
}

/* ───────────────────────── Lessons ───────────────────────── */

export async function upsertLesson(fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = toBigInt(fd.get('id'));
  const courseChapterId = toBigInt(fd.get('courseChapterId'));
  if (!courseChapterId) return { ok: false, message: 'فصل یافت نشد.' };

  const title = clean(fd.get('title'));
  if (!title) return { ok: false, message: 'عنوان درس الزامی است.' };

  const data = {
    title,
    description: clean(fd.get('description')),
    videoUrl: clean(fd.get('videoUrl')),
    attachment: clean(fd.get('attachment')),
    durationSeconds: toOptInt(fd.get('durationSeconds')),
    isFreePreview: fd.get('isFreePreview') === '1',
    sortOrder: toInt(fd.get('sortOrder')),
  };

  if (id) {
    await prisma.courseLesson.update({ where: { id }, data });
  } else {
    await prisma.courseLesson.create({ data: { ...data, courseChapterId } });
  }
  revalidatePath('/admins/courses');
  return { ok: true };
}

export async function deleteLesson(lessonId: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.courseLesson.delete({ where: { id: BigInt(lessonId) } });
  revalidatePath('/admins/courses');
  return { ok: true };
}

/* ───────────────────────── Course FAQs ───────────────────────── */

export async function upsertCourseFaq(fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = toBigInt(fd.get('id'));
  const courseId = toBigInt(fd.get('courseId'));
  if (!courseId) return { ok: false, message: 'دوره یافت نشد.' };

  const question = clean(fd.get('question'));
  const answer = clean(fd.get('answer'));
  if (!question || !answer) return { ok: false, message: 'سؤال و پاسخ الزامی است.' };

  if (id) {
    await prisma.courseFaq.update({ where: { id }, data: { question, answer, sortOrder: toInt(fd.get('sortOrder')) } });
  } else {
    await prisma.courseFaq.create({
      data: { courseId, question, answer, sortOrder: toInt(fd.get('sortOrder')) },
    });
  }
  revalidatePath('/admins/courses');
  return { ok: true };
}

export async function deleteCourseFaq(rowId: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.courseFaq.delete({ where: { id: BigInt(rowId) } });
  revalidatePath('/admins/courses');
  return { ok: true };
}

/* ───────────────────────── Course Features ───────────────────────── */

const COURSE_FEATURE_TYPES: CourseFeatureType[] = ['objective', 'audience', 'prerequisite'];

export async function upsertCourseFeature(fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = toBigInt(fd.get('id'));
  const courseId = toBigInt(fd.get('courseId'));
  if (!courseId) return { ok: false, message: 'دوره یافت نشد.' };

  const type = String(fd.get('type') ?? '') as CourseFeatureType;
  if (!COURSE_FEATURE_TYPES.includes(type)) return { ok: false, message: 'نوع معتبر نیست.' };
  const title = clean(fd.get('title'));
  if (!title) return { ok: false, message: 'متن الزامی است.' };

  if (id) {
    await prisma.courseFeature.update({ where: { id }, data: { title, type, sortOrder: toInt(fd.get('sortOrder')) } });
  } else {
    await prisma.courseFeature.create({
      data: { courseId, title, type, sortOrder: toInt(fd.get('sortOrder')) },
    });
  }
  revalidatePath('/admins/courses');
  return { ok: true };
}

export async function deleteCourseFeature(rowId: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.courseFeature.delete({ where: { id: BigInt(rowId) } });
  revalidatePath('/admins/courses');
  return { ok: true };
}

/* ───────────────────────── Course related & tags ───────────────────────── */

export async function saveCourseRelated(fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const courseId = toBigInt(fd.get('courseId'));
  if (!courseId) return { ok: false, message: 'دوره یافت نشد.' };

  const wanted: bigint[] = [];
  for (const [key, value] of fd.entries()) {
    if (key.startsWith('related:') && value === '1') wanted.push(BigInt(key.slice(8)));
  }
  await prisma.$transaction([
    prisma.courseRelated.deleteMany({ where: { courseId } }),
    prisma.courseRelated.createMany({
      data: wanted
        .filter((rid) => rid !== courseId)
        .map((rid) => ({ courseId, relatedCourseId: rid })),
    }),
  ]);
  revalidatePath('/admins/courses');
  return { ok: true };
}

export async function saveCourseTags(fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const courseId = toBigInt(fd.get('courseId'));
  if (!courseId) return { ok: false, message: 'دوره یافت نشد.' };

  const wanted: bigint[] = [];
  for (const [key, value] of fd.entries()) {
    if (key.startsWith('tag:') && value === '1') wanted.push(BigInt(key.slice(4)));
  }
  await prisma.$transaction([
    prisma.courseTag.deleteMany({ where: { courseId } }),
    prisma.courseTag.createMany({ data: wanted.map((tid) => ({ courseId, tagId: tid })) }),
  ]);
  revalidatePath('/admins/courses');
  revalidatePath('/courses');
  return { ok: true };
}
