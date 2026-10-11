'use client';

import { useMemo, useState } from 'react';
import { Search, X, Plus } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { ArticleCard } from '@/app/components/ui/cards';
import { articles, articleCategories } from '@/app/data/articles';

const PAGE_SIZE = 4;

export function ArticlesExplorer() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('همه');
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const q = query.trim();
    return articles.filter((a) => {
      const matchesCategory = category === 'همه' || a.category === category;
      const matchesQuery = !q || a.title.includes(q) || a.excerpt.includes(q) || a.category.includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  return (
    <div>
      <div className="flex flex-col gap-5 rounded-[26px] border border-cloud-300 bg-white p-5 shadow-card sm:p-6">
        <div className="relative">
          <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setVisible(PAGE_SIZE);
            }}
            placeholder="جستجو در مقالات..."
            aria-label="جستجوی مقالات"
            className="h-12 w-full rounded-2xl border border-cloud-300 bg-cloud-100 pe-12 ps-4 text-[14px] text-navy-900 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/15"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute left-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-ink-400 hover:bg-cloud-200"
              aria-label="پاک کردن جستجو"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="no-scrollbar -mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1">
          {articleCategories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                setCategory(c);
                setVisible(PAGE_SIZE);
              }}
              aria-pressed={category === c}
              className={cn(
                'shrink-0 rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors',
                category === c
                  ? 'border-navy-900 bg-navy-900 text-white'
                  : 'border-cloud-300 bg-white text-ink-600 hover:border-brand-200 hover:text-brand-600',
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {shown.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      ) : (
        <div className="mt-8 grid place-items-center rounded-[26px] border border-dashed border-cloud-400 bg-cloud-100 px-6 py-20 text-center">
          <h3 className="text-lg font-extrabold text-navy-900">مقاله‌ای یافت نشد</h3>
          <p className="mt-2 max-w-sm text-[13.5px] leading-7 text-ink-500">
            عبارت جستجو یا دسته‌بندی را تغییر دهید.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setCategory('همه');
            }}
            className="mt-5 rounded-full bg-navy-900 px-5 py-2.5 text-[13px] font-bold text-white hover:bg-brand-600"
          >
            حذف فیلترها
          </button>
        </div>
      )}

      {hasMore && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="inline-flex items-center gap-2 rounded-full border border-cloud-300 bg-white px-7 py-3.5 text-[13.5px] font-bold text-navy-900 shadow-card transition-colors hover:bg-cloud-100"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            نمایش مقالات بیشتر
          </button>
        </div>
      )}
    </div>
  );
}
