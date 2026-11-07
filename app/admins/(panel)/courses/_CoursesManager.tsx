'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, LoaderCircle, ChevronDown, ChevronRight } from 'lucide-react';
import {
  TableCard,
  Td,
  StatusPill,
  EmptyRow,
  AButton,
  AField,
  AInput,
  ATextarea,
  ASelect,
  ACheckbox,
  Notice,
  formatToman,
} from '@/app/admins/_components/kit';
import { ImageField } from '@/app/admins/_components/ImageField';
import { Modal } from '@/app/admins/_components/Modal';
import { ConfirmDelete, type ActionResult } from '@/app/admins/_components/Confirm';
import { RowShell } from '@/app/admins/_components/RowEditor';
import { useSaveAction } from '@/app/admins/_components/useSaveAction';
import {
  upsertCourse,
  deleteCourse,
  upsertChapter,
  deleteChapter,
  upsertLesson,
  deleteLesson,
  upsertCourseFaq,
  deleteCourseFaq,
  upsertCourseFeature,
  deleteCourseFeature,
  saveCourseRelated,
  saveCourseTags,
} from './actions';

export interface LessonRow {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  attachment: string | null;
  durationSeconds: number | null;
  isFreePreview: boolean;
  sortOrder: number;
}
export interface ChapterRow {
  id: string;
  title: string;
  description: string | null;
  durationLabel: string | null;
  sortOrder: number;
  lessons: LessonRow[];
}
export interface CourseRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  description: string | null;
  image: string | null;
  courseCategoryId: string | null;
  instructorId: string | null;
  categoryName: string | null;
  instructorName: string | null;
  durationLabel: string | null;
  level: string | null;
  price: number;
  originalPrice: number | null;
  isFeatured: boolean;
  status: string;
  publishedAt: string | null;
  sortOrder: number;
  metaTitle: string | null;
  metaDescription: string | null;
  enrollmentCount: number;
  createdAt: string;
  chapters: ChapterRow[];
  faqs: { id: string; question: string; answer: string; sortOrder: number }[];
  features: { id: string; type: string; title: string; sortOrder: number }[];
  related: string[];
  tagIds: string[];
  tagNames: string[];
}

type Opt = { id: string; name?: string; title?: string };

const FEATURE_LABEL: Record<string, string> = {
  objective: 'هدف',
  audience: 'مخاطب',
  prerequisite: 'پیش‌نیاز',
};

export function CoursesManager({
  rows,
  courseCategories,
  instructors,
  tags,
  courseOptions,
}: {
  rows: CourseRow[];
  courseCategories: Opt[];
  instructors: Opt[];
  tags: Opt[];
  courseOptions: Opt[];
}) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [editing, setEditing] = useState<CourseRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<CourseRow | null>(null);

  const filtered = rows.filter((r) => {
    const mq = query === '' || r.title.toLowerCase().includes(query.toLowerCase()) || r.slug.toLowerCase().includes(query.toLowerCase());
    const ms = status === 'all' || r.status === status;
    return mq && ms;
  });

  return (
    <div className="space-y-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو در دوره‌ها…"
            className="h-9 w-52 rounded-lg border border-cloud-300 bg-white px-3 text-[12.5px] outline-none placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
          />
          <div className="flex rounded-lg border border-cloud-300 bg-white p-0.5">
            {(['all', 'draft', 'published', 'archived'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={
                  'rounded-md px-3 py-1.5 text-[12px] font-bold transition-colors ' +
                  (status === s ? 'bg-navy-900 text-white' : 'text-ink-500 hover:text-navy-900')
                }
              >
                {s === 'all' ? 'همه' : s === 'draft' ? 'پیش‌نویس' : s === 'published' ? 'منتشر شده' : 'بایگانی'}
              </button>
            ))}
          </div>
        </div>
        <AButton onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> افزودن دوره
        </AButton>
      </div>

      <TableCard columns={['دوره', 'دسته', 'مبلغ', 'ثبت‌نام', 'وضعیت', 'عملیات']}>
        {filtered.length === 0 ? (
          <EmptyRow colSpan={6} label={query ? 'موردی یافت نشد' : 'هنوز دورهی ثبت نشده است'} />
        ) : (
          filtered.map((r) => (
            <tr key={r.id} className="transition-colors hover:bg-cloud-100/60">
              <Td>
                <p className="font-extrabold text-navy-900">{r.title}</p>
                <p className="text-[11.5px] text-ink-400" dir="ltr">{`/courses/${r.slug}`}</p>
              </Td>
              <Td>{r.categoryName ?? '—'}</Td>
              <Td className="whitespace-nowrap" dir="ltr">{formatToman(r.price)}</Td>
              <Td>{r.enrollmentCount.toLocaleString('fa-IR')}</Td>
              <Td><StatusPill value={r.status} /></Td>
              <Td>
                <div className="flex items-center gap-1.5">
                  <AButton variant="outline" className="h-8 px-2.5" onClick={() => setEditing(r)}>
                    <Pencil className="h-3.5 w-3.5" /> ویرایش
                  </AButton>
                  <AButton variant="danger" className="h-8 px-2.5 border-0 bg-red-50 text-red-600 hover:bg-red-100" onClick={() => setDeleting(r)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </AButton>
                </div>
              </Td>
            </tr>
          ))
        )}
      </TableCard>

      <CourseModal
        open={creating}
        onClose={() => setCreating(false)}
        courseCategories={courseCategories}
        instructors={instructors}
        tags={tags}
        courseOptions={courseOptions}
      />
      <CourseModal
        open={editing !== null}
        onClose={() => setEditing(null)}
        initial={editing ?? undefined}
        courseCategories={courseCategories}
        instructors={instructors}
        tags={tags}
        courseOptions={courseOptions}
      />
      <ConfirmDelete
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        label={`«${deleting?.title ?? ''}» و سرفصل‌ها و درس‌های آن حذف شوند؟`}
        action={async (): Promise<ActionResult> => deleteCourse(deleting?.id ?? '')}
      />
    </div>
  );
}

/* ───────────────────────── Course modal ───────────────────────── */

function CourseModal({
  open,
  onClose,
  initial,
  courseCategories,
  instructors,
  tags,
  courseOptions,
}: {
  open: boolean;
  onClose: () => void;
  initial?: CourseRow;
  courseCategories: Opt[];
  instructors: Opt[];
  tags: Opt[];
  courseOptions: Opt[];
}) {
  const c = initial;
  const [tab, setTab] = useState<'main' | 'content' | 'faqs' | 'features' | 'tags' | 'related'>('main');
  const main = useSaveAction(upsertCourse);

  // Reset to the first tab whenever the modal opens for another record.
  const openKey = open ? (c?.id ?? 'new') : null;
  const [prevOpenKey, setPrevOpenKey] = useState(openKey);
  if (prevOpenKey !== openKey) {
    setPrevOpenKey(openKey);
    if (open) setTab('main');
  }

  useEffect(() => {
    if (main.success && !c) onClose();
  }, [main.success, c, onClose]);

  const otherCourses = courseOptions.filter((o) => o.id !== c?.id);

  const tabs: [string, string][] = [
    ['main', 'اطلاعات'],
    ['content', `سرفصل‌ها (${c?.chapters.length ?? 0})`],
    ['faqs', `پرسش‌ها (${c?.faqs.length ?? 0})`],
    ['features', `ویژگی‌ها (${c?.features.length ?? 0})`],
    ['tags', `برچسب‌ها (${c?.tagIds.length ?? 0})`],
    ['related', 'دوره‌های مرتبط'],
  ];

  return (
    <Modal open={open} onClose={onClose} title={c ? 'ویرایش دوره' : 'افزودن دوره'} wide>
      <div className="mb-4 flex flex-wrap gap-1 rounded-lg bg-cloud-100 p-1">
        {tabs.map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k as typeof tab)}
            className={
              'rounded-md px-3 py-1.5 text-[12px] font-bold transition-colors ' +
              (tab === k ? 'bg-white text-navy-900 shadow-card' : 'text-ink-500 hover:text-navy-900')
            }
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'main' ? (
        <form onSubmit={main.onSubmit} className="space-y-4">
          <input type="hidden" name="id" value={c?.id ?? ''} />
          {main.error ? <Notice tone="error">{main.error}</Notice> : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AField label="عنوان" required>
              <AInput name="title" defaultValue={c?.title} required />
            </AField>
            <AField label="Slug" required>
              <AInput name="slug" defaultValue={c?.slug} dir="ltr" required className="text-left" />
            </AField>
            <AField label="دسته‌بندی">
              <ASelect name="courseCategoryId" defaultValue={c?.courseCategoryId ?? ''}>
                <option value="">— بدون دسته —</option>
                {courseCategories.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </ASelect>
            </AField>
            <AField label="مدرس / استاد">
              <ASelect name="instructorId" defaultValue={c?.instructorId ?? ''}>
                <option value="">— بدون استاد —</option>
                {instructors.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </ASelect>
            </AField>
            <AField label="عکس دوره" className="sm:col-span-2" hint="JPG، PNG یا WebP — حداکثر ۵ مگابایت">
              <ImageField name="image" defaultValue={c?.image} folder="courses" />
            </AField>
            <AField label="خلاصه" className="sm:col-span-2">
              <ATextarea name="excerpt" rows={2} defaultValue={c?.excerpt ?? ''} />
            </AField>
            <AField label="توضیحات کامل" className="sm:col-span-2">
              <ATextarea name="description" rows={5} defaultValue={c?.description ?? ''} />
            </AField>
            <AField label="برچسب مدت">
              <AInput name="durationLabel" defaultValue={c?.durationLabel ?? ''} placeholder="مثلا ۴۰ ساعت" />
            </AField>
            <AField label="سطح">
              <AInput name="level" defaultValue={c?.level ?? ''} placeholder="مقدماتی / متوسط / پیشرفته" />
            </AField>
            <AField label="مبلغ (تومان)">
              <AInput name="price" type="number" min={0} defaultValue={String(c?.price ?? 0)} dir="ltr" className="text-left" />
            </AField>
            <AField label="مبلغ اصلی (تومان)" hint="برای نمایش تخفیف">
              <AInput name="originalPrice" type="number" min={0} defaultValue={String(c?.originalPrice ?? '')} dir="ltr" className="text-left" />
            </AField>
            <AField label="ترتیب نمایش">
              <AInput name="sortOrder" type="number" min={0} defaultValue={String(c?.sortOrder ?? 0)} dir="ltr" className="text-left" />
            </AField>
            <AField label="وضعیت">
              <ASelect name="status" defaultValue={c?.status ?? 'draft'}>
                <option value="draft">پیش‌نویس</option>
                <option value="published">منتشر شده</option>
                <option value="archived">بایگانی</option>
              </ASelect>
            </AField>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <ACheckbox name="isFeatured" defaultChecked={c ? c.isFeatured : false} label="دوره برتر (نمایش در صفحه اصلی)" />
            </div>
            <AField label="SEO – عنوان" className="sm:col-span-2">
              <AInput name="metaTitle" defaultValue={c?.metaTitle ?? ''} />
            </AField>
            <AField label="SEO – توضیح" className="sm:col-span-2">
              <ATextarea name="metaDescription" rows={2} defaultValue={c?.metaDescription ?? ''} />
            </AField>
          </div>

          <div className="flex justify-end gap-2 border-t border-cloud-200 pt-4">
            <AButton variant="outline" type="button" onClick={onClose}>انصراف</AButton>
            <AButton type="submit" disabled={main.pending}>
              {main.pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              {c ? 'ذخیره تغییرات' : 'ایجاد دوره'}
            </AButton>
          </div>
        </form>
      ) : null}

      {tab === 'content' ? c ? <CourseContent courseId={c.id} chapters={c.chapters} /> : null : null}

      {tab === 'faqs' ? c ? (
        <div className="space-y-3">
          <FaqAddForm courseId={c.id} key={`fadd-${c.faqs.length}`} />
          {c.faqs.map((f) => <CourseFaqRow key={f.id} courseId={c.id} row={f} />)}
        </div>
      ) : null : null}

      {tab === 'features' ? c ? (
        <div className="space-y-3">
          <FeatureAddForm courseId={c.id} key={`feat-${c.features.length}`} />
          {c.features.map((f) => <CourseFeatureRow key={f.id} courseId={c.id} row={f} />)}
        </div>
      ) : null : null}

      {tab === 'tags' ? c ? (
        <TagsEditor courseId={c.id} tags={tags} checked={new Set(c.tagIds)} />
      ) : null : null}

      {tab === 'related' ? c ? (
        <RelatedEditor label="دوره" courseId={c.id} options={otherCourses} checked={new Set(c.related)} saveAction={saveCourseRelated} prefix="related:" />
      ) : null : null}

      {tab !== 'main' && !c ? (
        <p className="rounded-lg bg-cloud-100 px-3 py-3 text-[12.5px] text-ink-500">
          این بخش‌ها پس از ذخیرهٔ اولیهٔ دوره در دسترس هستند.
        </p>
      ) : null}
    </Modal>
  );
}

/* ───────────────────── Curriculum (chapters + lessons) ───────────────────── */

function CourseContent({ courseId, chapters }: { courseId: string; chapters: ChapterRow[] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-bold text-ink-500">سرفصل‌ها و درس‌های دوره</p>
        <span className="text-[11.5px] text-ink-400">{chapters.length.toLocaleString('fa-IR')} فصل</span>
      </div>

      <AddCard>
        <ChapterAddForm courseId={courseId} key={`chadd-${chapters.length}`} />
      </AddCard>

      {chapters.map((ch) => (
        <ChapterCard key={ch.id} courseId={courseId} chapter={ch} />
      ))}
    </div>
  );
}

function ChapterCard({ courseId, chapter }: { courseId: string; chapter: ChapterRow }) {
  const [open, setOpen] = useState(false);
  const edit = useSaveAction(upsertChapter);
  return (
    <RowShell
      title={`${chapter.title}`}
      subtitle={`${chapter.lessons.length.toLocaleString('fa-IR')} درس ${chapter.durationLabel ? '· ' + chapter.durationLabel : ''}`}
      onRemove={() => deleteChapter(chapter.id)}
    >
      <form onSubmit={edit.onSubmit} className="grid grid-cols-2 gap-3">
        <input type="hidden" name="id" value={chapter.id} />
        <input type="hidden" name="courseId" value={courseId} />
        <AField label="عنوان فصل">
          <AInput name="title" defaultValue={chapter.title} />
        </AField>
        <AField label="برچسب مدت">
          <AInput name="durationLabel" defaultValue={chapter.durationLabel ?? ''} />
        </AField>
        <AField label="توضیح" className="col-span-2">
          <AInput name="description" defaultValue={chapter.description ?? ''} />
        </AField>
        <AField label="ترتیب">
          <AInput name="sortOrder" type="number" defaultValue={String(chapter.sortOrder)} dir="ltr" className="text-left" />
        </AField>
        <div className="col-span-2 flex items-center justify-end gap-2">
          <button type="button" onClick={() => setOpen((o) => !o)} className="flex items-center gap-1 text-[12px] font-bold text-brand-600 hover:text-brand-700">
            {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            {open ? 'بستن درس‌ها' : `درس‌ها (${chapter.lessons.length})`}
          </button>
          <RowSaveButton pending={false} />
        </div>
      </form>

      {open ? (
        <div className="mt-4 space-y-2 border-t border-cloud-200 pt-4">
          <LessonAddForm chapterId={chapter.id} key={`ladd-${chapter.lessons.length}`} />
          {chapter.lessons.map((l) => (
            <LessonRow key={l.id} chapterId={chapter.id} lesson={l} />
          ))}
        </div>
      ) : null}
    </RowShell>
  );
}


function ChapterAddForm({ courseId }: { courseId: string }) {
  const api = useSaveAction(upsertChapter);
  return (
    <form onSubmit={api.onSubmit} className="grid grid-cols-2 gap-3">
      <input type="hidden" name="courseId" value={courseId} />
      <AField label="عنوان فصل جدید" required>
        <AInput name="title" required placeholder="مثلا مقدمه و کلیات" />
      </AField>
      <AField label="برچسب مدت">
        <AInput name="durationLabel" />
      </AField>
      <AField label="ترتیب">
        <AInput name="sortOrder" type="number" defaultValue="0" dir="ltr" className="text-left" />
      </AField>
      {api.error ? <p className="col-span-2 -mt-1 text-[12px] text-red-600">{api.error}</p> : null}
      <div className="col-span-2 flex justify-end">
        <RowSaveButton pending={api.pending} label="افزودن فصل" />
      </div>
    </form>
  );
}

function LessonRow({ chapterId, lesson }: { chapterId: string; lesson: LessonRow }) {
  const api = useSaveAction(upsertLesson);
  return (
    <div className="rounded-lg border border-cloud-200 bg-white p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[12.5px] font-extrabold text-navy-900">{lesson.title}</p>
        <button
          type="button"
          onClick={() => {
            if (confirm(`درس «${lesson.title}» حذف شود؟`)) deleteLesson(lesson.id);
          }}
          className="grid h-7 w-7 place-items-center rounded text-ink-400 hover:bg-red-50 hover:text-red-600"
          aria-label="حذف درس"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <form onSubmit={api.onSubmit} className="grid grid-cols-2 gap-2.5">
        <input type="hidden" name="id" value={lesson.id} />
        <input type="hidden" name="courseChapterId" value={chapterId} />
        <AField label="عنوان" className="col-span-2">
          <AInput name="title" defaultValue={lesson.title} />
        </AField>
        <AField label="لینک ویدیو">
          <AInput name="videoUrl" defaultValue={lesson.videoUrl ?? ''} dir="ltr" className="text-left" />
        </AField>
        <AField label="لینک پیوست">
          <AInput name="attachment" defaultValue={lesson.attachment ?? ''} dir="ltr" className="text-left" />
        </AField>
        <AField label="توضیح">
          <AInput name="description" defaultValue={lesson.description ?? ''} />
        </AField>
        <AField label="مدت (ثانیه)">
          <AInput name="durationSeconds" type="number" min={0} defaultValue={String(lesson.durationSeconds ?? '')} dir="ltr" className="text-left" />
        </AField>
        <div className="col-span-2 flex items-center justify-between gap-2">
          <ACheckbox name="isFreePreview" defaultChecked={lesson.isFreePreview} label="پیش‌نمایش رایگان" />
          <div className="flex items-center gap-2">
            <input type="hidden" name="sortOrder" value={String(lesson.sortOrder)} />
            <RowSaveButton pending={api.pending} />
          </div>
        </div>
      </form>
    </div>
  );
}

function LessonAddForm({ chapterId }: { chapterId: string }) {
  const api = useSaveAction(upsertLesson);
  return (
    <div className="rounded-lg border border-dashed border-cloud-400 bg-cloud-100/50 p-3">
      <form onSubmit={api.onSubmit} className="grid grid-cols-2 gap-2.5">
        <input type="hidden" name="courseChapterId" value={chapterId} />
        <AField label="درس جدید" className="col-span-2">
          <AInput name="title" required placeholder="عنوان درس" />
        </AField>
        <AField label="لینک ویدیو">
          <AInput name="videoUrl" dir="ltr" className="text-left" />
        </AField>
        <AField label="لینک پیوست">
          <AInput name="attachment" dir="ltr" className="text-left" />
        </AField>
        {api.error ? <p className="col-span-2 -mt-1 text-[12px] text-red-600">{api.error}</p> : null}
        <div className="col-span-2 flex justify-end">
          <RowSaveButton pending={api.pending} label="افزودن درس" />
        </div>
      </form>
    </div>
  );
}

/* ───────────────────── Course FAQ / Feature rows ───────────────────── */

function FaqAddForm({ courseId }: { courseId: string }) {
  const api = useSaveAction(upsertCourseFaq);
  return (
    <AddCard>
      <form onSubmit={api.onSubmit} className="grid grid-cols-1 gap-3">
        <input type="hidden" name="courseId" value={courseId} />
        <AField label="سؤال" required><AInput name="question" required /></AField>
        <AField label="پاسخ" required><ATextarea name="answer" rows={2} required /></AField>
        {api.error ? <p className="-mt-1 text-[12px] text-red-600">{api.error}</p> : null}
        <div className="flex justify-end"><RowSaveButton pending={api.pending} label="افزودن پرسش" /></div>
      </form>
    </AddCard>
  );
}

function CourseFaqRow({ courseId, row }: { courseId: string; row: CourseRow['faqs'][number] }) {
  const api = useSaveAction(upsertCourseFaq);
  return (
    <RowShell title={row.question} onRemove={() => deleteCourseFaq(row.id)}>
      <form onSubmit={api.onSubmit} className="grid grid-cols-1 gap-3">
        <input type="hidden" name="id" value={row.id} />
        <input type="hidden" name="courseId" value={courseId} />
        <AField label="سؤال"><AInput name="question" defaultValue={row.question} /></AField>
        <AField label="پاسخ"><ATextarea name="answer" rows={2} defaultValue={row.answer} /></AField>
        <AField label="ترتیب"><AInput name="sortOrder" type="number" defaultValue={String(row.sortOrder)} dir="ltr" className="text-left" /></AField>
        {api.error ? <p className="-mt-1 text-[12px] text-red-600">{api.error}</p> : null}
        <div className="flex justify-end"><RowSaveButton pending={api.pending} /></div>
      </form>
    </RowShell>
  );
}

function FeatureAddForm({ courseId }: { courseId: string }) {
  const api = useSaveAction(upsertCourseFeature);
  return (
    <AddCard>
      <form onSubmit={api.onSubmit} className="grid grid-cols-2 gap-3">
        <input type="hidden" name="courseId" value={courseId} />
        <AField label="نوع">
          <ASelect name="type" defaultValue="objective">
            <option value="objective">هدف</option>
            <option value="audience">مخاطب</option>
            <option value="prerequisite">پیش‌نیاز</option>
          </ASelect>
        </AField>
        <AField label="متن" required><AInput name="title" required /></AField>
        {api.error ? <p className="col-span-2 -mt-1 text-[12px] text-red-600">{api.error}</p> : null}
        <div className="col-span-2 flex justify-end"><RowSaveButton pending={api.pending} label="افزودن ویژگی" /></div>
      </form>
    </AddCard>
  );
}

function CourseFeatureRow({ courseId, row }: { courseId: string; row: CourseRow['features'][number] }) {
  const api = useSaveAction(upsertCourseFeature);
  return (
    <RowShell title={`${FEATURE_LABEL[row.type] ?? row.type}: ${row.title}`} onRemove={() => deleteCourseFeature(row.id)}>
      <form onSubmit={api.onSubmit} className="grid grid-cols-2 gap-3">
        <input type="hidden" name="id" value={row.id} />
        <input type="hidden" name="courseId" value={courseId} />
        <AField label="نوع">
          <ASelect name="type" defaultValue={row.type}>
            <option value="objective">هدف</option>
            <option value="audience">مخاطب</option>
            <option value="prerequisite">پیش‌نیاز</option>
          </ASelect>
        </AField>
        <AField label="متن"><AInput name="title" defaultValue={row.title} /></AField>
        <AField label="ترتیب"><AInput name="sortOrder" type="number" defaultValue={String(row.sortOrder)} dir="ltr" className="text-left" /></AField>
        {api.error ? <p className="col-span-2 -mt-1 text-[12px] text-red-600">{api.error}</p> : null}
        <div className="col-span-2 flex justify-end"><RowSaveButton pending={api.pending} /></div>
      </form>
    </RowShell>
  );
}

/* ───────────────────── Tags & related editors ───────────────────── */

function TagsEditor({ courseId, tags, checked }: { courseId: string; tags: Opt[]; checked: Set<string> }) {
  const api = useSaveAction(saveCourseTags);
  return (
    <form onSubmit={api.onSubmit} className="space-y-4">
      <input type="hidden" name="courseId" value={courseId} />
      {api.success ? <Notice tone="success">ذخیره شد.</Notice> : null}
      {api.error ? <Notice tone="error">{api.error}</Notice> : null}
      {tags.length === 0 ? (
        <p className="text-[13px] text-ink-500">برچسبی وجود ندارد. از بخش «دسته‌ها و برچسب‌ها» ایجاد کنید.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => {
            const isChecked = checked.has(t.id);
            return (
              <label
                key={t.id}
                className={
                  'flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-bold transition-colors ' +
                  (isChecked ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-cloud-300 bg-white text-ink-500 hover:bg-cloud-100')
                }
              >
                <input type="hidden" name={`tag:${t.id}`} value="0" />
                <input type="checkbox" name={`tag:${t.id}`} defaultChecked={isChecked} className="h-3.5 w-3.5 accent-brand-600" />
                {t.name}
              </label>
            );
          })}
        </div>
      )}
      <div className="flex justify-end">
        <AButton type="submit" disabled={api.pending}>
          {api.pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null} ذخیره برچسب‌ها
        </AButton>
      </div>
    </form>
  );
}

function RelatedEditor({
  label,
  courseId,
  options,
  checked,
  saveAction,
  prefix,
}: {
  label: string;
  courseId: string;
  options: Opt[];
  checked: Set<string>;
  saveAction: (fd: FormData) => Promise<ActionResult>;
  prefix: string;
}) {
  const api = useSaveAction(saveAction);
  return (
    <form onSubmit={api.onSubmit} className="space-y-4">
      <input type="hidden" name="courseId" value={courseId} />
      {api.success ? <Notice tone="success">ذخیره شد.</Notice> : null}
      {api.error ? <Notice tone="error">{api.error}</Notice> : null}
      {options.length === 0 ? <p className="text-[13px] text-ink-500">مورد دیگری برای ارتباط وجود ندارد.</p> : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {options.map((o) => {
            const isChecked = checked.has(o.id);
            return (
              <label
                key={o.id}
                className={
                  'flex items-center gap-2.5 rounded-lg border px-3 py-2.5 transition-colors ' +
                  (isChecked ? 'border-brand-400 bg-brand-50/60' : 'border-cloud-300 bg-white hover:bg-cloud-100')
                }
              >
                <input type="hidden" name={`${prefix}${o.id}`} value="0" />
                <ACheckbox name={`${prefix}${o.id}`} defaultChecked={isChecked} />
                <span className="text-[13px] font-semibold text-navy-900">{o.title ?? o.name}</span>
              </label>
            );
          })}
        </div>
      )}
      <div className="flex justify-end">
        <AButton type="submit" disabled={api.pending}>
          {api.pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null} ذخیره {label}های مرتبط
        </AButton>
      </div>
    </form>
  );
}

/* ───────────────────── Shared small pieces ───────────────────── */

function AddCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-cloud-400 bg-cloud-100/60 p-4">{children}</div>
  );
}

function RowSaveButton({ pending, label }: { pending: boolean; label?: string }) {
  return (
    <AButton type="submit" variant="outline" className="h-8 px-3" disabled={pending}>
      {pending ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : null}
      {label ?? 'ذخیره'}
    </AButton>
  );
}
