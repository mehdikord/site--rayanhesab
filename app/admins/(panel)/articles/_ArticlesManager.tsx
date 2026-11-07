'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, LoaderCircle } from 'lucide-react';
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
} from '@/app/admins/_components/kit';
import { toLocalInputValue } from '@/app/lib/datetime';
import { ImageField } from '@/app/admins/_components/ImageField';
import { Modal } from '@/app/admins/_components/Modal';
import { ConfirmDelete, type ActionResult } from '@/app/admins/_components/Confirm';
import { useSaveAction } from '@/app/admins/_components/useSaveAction';
import { upsertArticle, deleteArticle, saveArticleRelated } from './actions';

export interface ArticleRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  image: string | null;
  authorName: string | null;
  authorRole: string | null;
  readingTime: number | null;
  viewsCount: number;
  status: string;
  publishedAt: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  categoryId: string | null;
  adminId: string | null;
  categoryName: string | null;
  adminName: string | null;
  related: string[];
  createdAt: string;
}

type Opt = { id: string; name?: string; title?: string };

export function ArticlesManager({
  rows,
  categories,
  admins,
  articleOptions,
}: {
  rows: ArticleRow[];
  categories: Opt[];
  admins: Opt[];
  articleOptions: Opt[];
}) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [editing, setEditing] = useState<ArticleRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<ArticleRow | null>(null);

  const filtered = rows.filter((r) => {
    const mq =
      query === '' ||
      r.title.toLowerCase().includes(query.toLowerCase()) ||
      r.slug.toLowerCase().includes(query.toLowerCase());
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
            placeholder="جستجو در مقالات…"
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
          <Plus className="h-4 w-4" /> افزودن مقاله
        </AButton>
      </div>

      <TableCard columns={['مقاله', 'دسته', 'نویسنده', 'بازدید', 'وضعیت', 'عملیات']}>
        {filtered.length === 0 ? (
          <EmptyRow colSpan={6} label={query ? 'موردی یافت نشد' : 'هنوز مقاله‌ای ثبت نشده است'} />
        ) : (
          filtered.map((r) => (
            <tr key={r.id} className="transition-colors hover:bg-cloud-100/60">
              <Td>
                <p className="font-extrabold text-navy-900">{r.title}</p>
                <p className="text-[11.5px] text-ink-400" dir="ltr">{`/articles/${r.slug}`}</p>
              </Td>
              <Td>{r.categoryName ?? '—'}</Td>
              <Td>{r.authorName ?? r.adminName ?? '—'}</Td>
              <Td>{r.viewsCount.toLocaleString('fa-IR')}</Td>
              <Td><StatusPill value={r.status} /></Td>
              <Td>
                <div className="flex items-center gap-1.5">
                  <AButton variant="outline" className="h-8 px-2.5" onClick={() => setEditing(r)}>
                    <Pencil className="h-3.5 w-3.5" /> ویرایش
                  </AButton>
                  <AButton
                    variant="danger"
                    className="h-8 px-2.5 border-0 bg-red-50 text-red-600 hover:bg-red-100"
                    onClick={() => setDeleting(r)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </AButton>
                </div>
              </Td>
            </tr>
          ))
        )}
      </TableCard>

      <ArticleModal
        open={creating}
        onClose={() => setCreating(false)}
        categories={categories}
        admins={admins}
        articleOptions={articleOptions}
      />
      <ArticleModal
        open={editing !== null}
        onClose={() => setEditing(null)}
        initial={editing ?? undefined}
        categories={categories}
        admins={admins}
        articleOptions={articleOptions}
      />
      <ConfirmDelete
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        label={`«${deleting?.title ?? ''}» حذف شود؟`}
        action={async (): Promise<ActionResult> => deleteArticle(deleting?.id ?? '')}
      />
    </div>
  );
}

/* ───────────────────────── Article modal ───────────────────────── */

function ArticleModal({
  open,
  onClose,
  initial,
  categories,
  admins,
  articleOptions,
}: {
  open: boolean;
  onClose: () => void;
  initial?: ArticleRow;
  categories: Opt[];
  admins: Opt[];
  articleOptions: Opt[];
}) {
  const a = initial;
  const [tab, setTab] = useState<'main' | 'related'>('main');
  const main = useSaveAction(upsertArticle);

  // Reset to the first tab whenever the modal opens for another record.
  const openKey = open ? (a?.id ?? 'new') : null;
  const [prevOpenKey, setPrevOpenKey] = useState(openKey);
  if (prevOpenKey !== openKey) {
    setPrevOpenKey(openKey);
    if (open) setTab('main');
  }

  useEffect(() => {
    if (main.success && !a) onClose();
  }, [main.success, a, onClose]);

  const otherArticles = articleOptions.filter((o) => o.id !== a?.id);

  const tabs: [string, string][] = [
    ['main', 'اطلاعات'],
    ['related', `مقالات مرتبط (${a?.related.length ?? 0})`],
  ];

  return (
    <Modal open={open} onClose={onClose} title={a ? 'ویرایش مقاله' : 'افزودن مقاله'} wide>
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
          <input type="hidden" name="id" value={a?.id ?? ''} />
          {main.error ? <Notice tone="error">{main.error}</Notice> : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AField label="عنوان" required>
              <AInput name="title" defaultValue={a?.title} required />
            </AField>
            <AField label="Slug" required>
              <AInput name="slug" defaultValue={a?.slug} dir="ltr" required className="text-left" />
            </AField>
            <AField label="دسته">
              <ASelect name="articleCategoryId" defaultValue={a?.categoryId ?? ''}>
                <option value="">— بدون دسته —</option>
                {categories.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </ASelect>
            </AField>
            <AField label="ثبت‌کننده (مدیر)">
              <ASelect name="adminId" defaultValue={a?.adminId ?? ''}>
                <option value="">— بدون ثبت‌کننده —</option>
                {admins.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </ASelect>
            </AField>
            <AField label="نام نویسنده" className="sm:col-span-2">
              <AInput name="authorName" defaultValue={a?.authorName ?? ''} />
            </AField>
            <AField label="نقش نویسنده">
              <AInput name="authorRole" defaultValue={a?.authorRole ?? ''} />
            </AField>
            <AField label="تصویر">
              <ImageField name="image" defaultValue={a?.image} folder="articles" />
            </AField>
            <AField label="خلاصه" className="sm:col-span-2">
              <ATextarea name="excerpt" rows={2} defaultValue={a?.excerpt ?? ''} />
            </AField>
            <AField label="متن مقاله" className="sm:col-span-2">
              <ATextarea name="body" rows={8} defaultValue={a?.body ?? ''} />
            </AField>
            <AField label="زمان مطالعه (دقیقه)">
              <AInput name="readingTime" type="number" min={0} defaultValue={String(a?.readingTime ?? '')} dir="ltr" className="text-left" />
            </AField>
            <AField label="وضعیت">
              <ASelect name="status" defaultValue={a?.status ?? 'draft'}>
                <option value="draft">پیش‌نویس</option>
                <option value="published">منتشر شده</option>
                <option value="archived">بایگانی</option>
              </ASelect>
            </AField>
            <AField label="تاریخ انتشار">
              <AInput
                name="publishedAt"
                type="datetime-local"
                defaultValue={toLocalInputValue(a?.publishedAt)}
                dir="ltr"
                className="text-left"
              />
            </AField>
            <AField label="SEO – عنوان">
              <AInput name="metaTitle" defaultValue={a?.metaTitle ?? ''} />
            </AField>
            <AField label="SEO – توضیح" className="sm:col-span-2">
              <ATextarea name="metaDescription" rows={2} defaultValue={a?.metaDescription ?? ''} />
            </AField>
          </div>

          <div className="flex justify-end gap-2 border-t border-cloud-200 pt-4">
            <AButton variant="outline" type="button" onClick={onClose}>انصراف</AButton>
            <AButton type="submit" disabled={main.pending}>
              {main.pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              {a ? 'ذخیره تغییرات' : 'ایجاد مقاله'}
            </AButton>
          </div>
        </form>
      ) : null}

      {tab === 'related' && a ? (
        <RelatedEditor articleId={a.id} options={otherArticles} checked={new Set(a.related)} />
      ) : null}

      {tab !== 'main' && !a ? (
        <p className="rounded-lg bg-cloud-100 px-3 py-3 text-[12.5px] text-ink-500">
          این بخش پس از ذخیرهٔ اولیهٔ مقاله در دسترس است.
        </p>
      ) : null}
    </Modal>
  );
}

/* ───────────────────────── Related editor ───────────────────────── */

function RelatedEditor({
  articleId,
  options,
  checked,
}: {
  articleId: string;
  options: Opt[];
  checked: Set<string>;
}) {
  const api = useSaveAction(saveArticleRelated);
  return (
    <form onSubmit={api.onSubmit} className="space-y-4">
      <input type="hidden" name="articleId" value={articleId} />
      {api.success ? <Notice tone="success">ذخیره شد.</Notice> : null}
      {api.error ? <Notice tone="error">{api.error}</Notice> : null}

      {options.length === 0 ? (
        <p className="text-[13px] text-ink-500">مقالهٔ دیگری وجود ندارد.</p>
      ) : (
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
                <input type="hidden" name={`related:${o.id}`} value="0" />
                <ACheckbox name={`related:${o.id}`} defaultChecked={isChecked} />
                <span className="text-[13px] font-semibold text-navy-900">{o.title ?? o.name}</span>
              </label>
            );
          })}
        </div>
      )}

      <div className="flex justify-end">
        <AButton type="submit" disabled={api.pending}>
          {api.pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          ذخیره مقالات مرتبط
        </AButton>
      </div>
    </form>
  );
}
