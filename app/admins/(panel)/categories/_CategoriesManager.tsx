'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, LoaderCircle } from 'lucide-react';
import {
  Td,
  EmptyRow,
  AButton,
  AField,
  AInput,
  ATextarea,
  ACheckbox,
  Notice,
} from '@/app/admins/_components/kit';
import { TableBare } from '@/app/admins/_components/kit';
import { Modal } from '@/app/admins/_components/Modal';
import { ConfirmDelete, type ActionResult } from '@/app/admins/_components/Confirm';
import { useSaveAction } from '@/app/admins/_components/useSaveAction';
import {
  upsertArticleCategory,
  deleteArticleCategory,
  upsertCourseCategory,
  deleteCourseCategory,
  upsertTag,
  deleteTag,
} from './actions';

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  usageCount: number;
}
export interface TagRow {
  id: string;
  name: string;
  slug: string;
  usageCount: number;
}

type Tab = 'articles' | 'courses' | 'tags';

export function CategoriesManager({
  articleCategories,
  courseCategories,
  tags,
}: {
  articleCategories: CategoryRow[];
  courseCategories: CategoryRow[];
  tags: TagRow[];
}) {
  const [tab, setTab] = useState<Tab>('articles');
  const [deleting, setDeleting] = useState<{
    label: string;
    action: () => Promise<ActionResult>;
  } | null>(null);

  const tabs: [Tab, string][] = [
    ['articles', `دسته مقالات (${articleCategories.length.toLocaleString('fa-IR')})`],
    ['courses', `دسته دوره‌ها (${courseCategories.length.toLocaleString('fa-IR')})`],
    ['tags', `برچسب‌ها (${tags.length.toLocaleString('fa-IR')})`],
  ];

  return (
    <div className="space-y-4 p-5">
      <div className="flex flex-wrap gap-1 rounded-lg bg-cloud-100 p-1">
        {tabs.map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={
              'rounded-md px-3 py-1.5 text-[12px] font-bold transition-colors ' +
              (tab === k ? 'bg-white text-navy-900 shadow-card' : 'text-ink-500 hover:text-navy-900')
            }
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'articles' ? (
        <CategorySection
          kind="article"
          rows={articleCategories}
          emptyLabel="هنوز دسته‌ای ثبت نشده است"
          onDelete={(r) =>
            setDeleting({
              label: `«${r.name}» حذف شود؟`,
              action: async (): Promise<ActionResult> => deleteArticleCategory(r.id),
            })
          }
        />
      ) : null}

      {tab === 'courses' ? (
        <CategorySection
          kind="course"
          rows={courseCategories}
          emptyLabel="هنوز دسته‌ای ثبت نشده است"
          onDelete={(r) =>
            setDeleting({
              label: `«${r.name}» حذف شود؟`,
              action: async (): Promise<ActionResult> => deleteCourseCategory(r.id),
            })
          }
        />
      ) : null}

      {tab === 'tags' ? (
        <TagsSection
          rows={tags}
          onDelete={(r) =>
            setDeleting({
              label: `«${r.name}» حذف شود؟`,
              action: async (): Promise<ActionResult> => deleteTag(r.id),
            })
          }
        />
      ) : null}

      <ConfirmDelete
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        label={deleting?.label ?? ''}
        action={async (): Promise<ActionResult> =>
          deleting ? deleting.action() : { ok: true }
        }
      />
    </div>
  );
}

/* ───────────────────────── Category (article | course) ───────────────────────── */

function CategorySection({
  kind,
  rows,
  emptyLabel,
  onDelete,
}: {
  kind: 'article' | 'course';
  rows: CategoryRow[];
  emptyLabel: string;
  onDelete: (row: CategoryRow) => void;
}) {
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [creating, setCreating] = useState(false);

  const title = kind === 'article' ? 'دسته مقالات' : 'دسته دوره‌ها';
  const usageLabel = kind === 'article' ? 'مقاله' : 'دوره';
  const save = kind === 'article' ? upsertArticleCategory : upsertCourseCategory;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[12.5px] text-ink-500">
          دسته‌های {title.toLowerCase()} که در صفحات نمایش استفاده می‌شوند.
        </p>
        <AButton onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> افزودن {title.slice(0, 4)} جدید
        </AButton>
      </div>

      <TableBare columns={['نام', 'Slug', usageLabel, 'ترتیب', 'وضعیت', 'عملیات']}>
        {rows.length === 0 ? (
          <EmptyRow colSpan={6} label={emptyLabel} />
        ) : (
          rows.map((r) => (
            <tr key={r.id} className="transition-colors hover:bg-cloud-100/60">
              <Td>
                <p className="font-extrabold text-navy-900">{r.name}</p>
                {r.description ? (
                  <p className="max-w-52 truncate text-[11.5px] text-ink-400">{r.description}</p>
                ) : null}
              </Td>
              <Td><span dir="ltr" className="text-[12px] text-ink-500">{r.slug}</span></Td>
              <Td>{r.usageCount.toLocaleString('fa-IR')}</Td>
              <Td>{r.sortOrder.toLocaleString('fa-IR')}</Td>
              <Td>
                <span
                  className={
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11.5px] font-bold ring-1 ring-inset ' +
                    (r.isActive
                      ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                      : 'bg-cloud-200 text-ink-500 ring-cloud-400/40')
                  }
                >
                  {r.isActive ? 'فعال' : 'غیرفعال'}
                </span>
              </Td>
              <Td>
                <div className="flex items-center gap-1.5">
                  <AButton variant="outline" className="h-8 px-2.5" onClick={() => setEditing(r)}>
                    <Pencil className="h-3.5 w-3.5" /> ویرایش
                  </AButton>
                  <AButton
                    variant="danger"
                    className="h-8 px-2.5 border-0 bg-red-50 text-red-600 hover:bg-red-100"
                    onClick={() => onDelete(r)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </AButton>
                </div>
              </Td>
            </tr>
          ))
        )}
      </TableBare>

      <CategoryModal
        open={creating}
        onClose={() => setCreating(false)}
        save={save}
      />
      <CategoryModal
        open={editing !== null}
        onClose={() => setEditing(null)}
        save={save}
        initial={editing ?? undefined}
      />
    </div>
  );
}

function CategoryModal({
  open,
  onClose,
  initial,
  save,
}: {
  open: boolean;
  onClose: () => void;
  initial?: CategoryRow;
  save: (fd: FormData) => Promise<ActionResult>;
}) {
  const api = useSaveAction(save);
  const c = initial;

  return (
    <Modal open={open} onClose={onClose} title={c ? 'ویرایش دسته' : 'افزودن دسته'}>
      <form onSubmit={api.onSubmit} className="space-y-4">
        <input type="hidden" name="id" value={c?.id ?? ''} />
        {api.error ? <Notice tone="error">{api.error}</Notice> : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AField label="نام" required>
            <AInput name="name" defaultValue={c?.name} required />
          </AField>
          <AField label="Slug" hint="در صورت خالی بودن، به‌صورت خودکار از نام ساخته می‌شود">
            <AInput name="slug" defaultValue={c?.slug} dir="ltr" className="text-left" />
          </AField>
          <AField label="توضیح" className="sm:col-span-2">
            <ATextarea name="description" rows={2} defaultValue={c?.description ?? ''} />
          </AField>
          <AField label="ترتیب نمایش">
            <AInput name="sortOrder" type="number" min={0} defaultValue={String(c?.sortOrder ?? 0)} dir="ltr" className="text-left" />
          </AField>
          <div>
            <ACheckbox name="isActive" defaultChecked={c ? c.isActive : true} label="فعال" />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-cloud-200 pt-4">
          <AButton variant="outline" type="button" onClick={onClose}>انصراف</AButton>
          <AButton type="submit" disabled={api.pending}>
            {api.pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            {c ? 'ذخیره تغییرات' : 'ایجاد دسته'}
          </AButton>
        </div>
      </form>
    </Modal>
  );
}

/* ───────────────────────── Tags ───────────────────────── */

function TagsSection({
  rows,
  onDelete,
}: {
  rows: TagRow[];
  onDelete: (row: TagRow) => void;
}) {
  const [editing, setEditing] = useState<TagRow | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[12.5px] text-ink-500">برچسب‌های دوره‌های آموزشی.</p>
        <AButton onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> افزودن برچسب
        </AButton>
      </div>

      <TableBare columns={['نام', 'Slug', 'دوره', 'عملیات']}>
        {rows.length === 0 ? (
          <EmptyRow colSpan={4} label="هنوز برچسبی ثبت نشده است" />
        ) : (
          rows.map((r) => (
            <tr key={r.id} className="transition-colors hover:bg-cloud-100/60">
              <Td><span className="font-extrabold text-navy-900">{r.name}</span></Td>
              <Td><span dir="ltr" className="text-[12px] text-ink-500">{r.slug}</span></Td>
              <Td>{r.usageCount.toLocaleString('fa-IR')}</Td>
              <Td>
                <div className="flex items-center gap-1.5">
                  <AButton variant="outline" className="h-8 px-2.5" onClick={() => setEditing(r)}>
                    <Pencil className="h-3.5 w-3.5" /> ویرایش
                  </AButton>
                  <AButton
                    variant="danger"
                    className="h-8 px-2.5 border-0 bg-red-50 text-red-600 hover:bg-red-100"
                    onClick={() => onDelete(r)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </AButton>
                </div>
              </Td>
            </tr>
          ))
        )}
      </TableBare>

      <TagModal open={creating} onClose={() => setCreating(false)} />
      <TagModal
        open={editing !== null}
        onClose={() => setEditing(null)}
        initial={editing ?? undefined}
      />
    </div>
  );
}

function TagModal({
  open,
  onClose,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  initial?: TagRow;
}) {
  const api = useSaveAction(upsertTag);
  const t = initial;

  return (
    <Modal open={open} onClose={onClose} title={t ? 'ویرایش برچسب' : 'افزودن برچسب'}>
      <form onSubmit={api.onSubmit} className="space-y-4">
        <input type="hidden" name="id" value={t?.id ?? ''} />
        {api.error ? <Notice tone="error">{api.error}</Notice> : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AField label="نام" required>
            <AInput name="name" defaultValue={t?.name} required />
          </AField>
          <AField label="Slug" hint="در صورت خالی بودن، به‌صورت خودکار از نام ساخته می‌شود">
            <AInput name="slug" defaultValue={t?.slug} dir="ltr" className="text-left" />
          </AField>
        </div>

        <div className="flex justify-end gap-2 border-t border-cloud-200 pt-4">
          <AButton variant="outline" type="button" onClick={onClose}>انصراف</AButton>
          <AButton type="submit" disabled={api.pending}>
            {api.pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            {t ? 'ذخیره تغییرات' : 'ایجاد برچسب'}
          </AButton>
        </div>
      </form>
    </Modal>
  );
}
