'use client';

import { useMemo, useState } from 'react';
import { Search, LayoutGrid, X } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { CourseCard } from '@/app/components/ui/cards';
import { courses, courseCategories } from '@/app/data/courses';

export function CourseCatalog() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('همه');
  const [sort, setSort] = useState<'newest' | 'cheapest' | 'expensive'>('newest');

  const filtered = useMemo(() => {
    let list = courses.filter((c) => {
      const matchesCategory = category === 'همه' || c.category === category;
      const q = query.trim();
      const matchesQuery =
        !q ||
        c.title.includes(q) ||
        c.instructor.includes(q) ||
        c.category.includes(q);
      return matchesCategory && matchesQuery;
    });
    if (sort === 'cheapest') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'expensive') list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [query, category, sort]);

  return (
    <div>
      <div className="flex flex-col gap-5 rounded-[26px] border border-cloud-300 bg-white p-5 shadow-card sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجوی دوره، مدرس یا دسته‌بندی..."
              aria-label="جستجوی دوره"
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
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              aria-label="ترتیب نمایش"
              className="h-12 w-full appearance-none rounded-2xl border border-cloud-300 bg-cloud-100 ps-4 pe-10 text-[13.5px] font-semibold text-navy-900 outline-none focus:border-brand-500 focus:bg-white lg:w-52"
            >
              <option value="newest">جدیدترین</option>
              <option value="cheapest">ارزان‌ترین</option>
              <option value="expensive">گران‌ترین</option>
            </select>
          </div>
        </div>

        <div className="no-scrollbar -mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1">
          <span className="hidden shrink-0 items-center gap-1.5 pe-2 text-[13px] font-bold text-ink-500 sm:flex">
            <LayoutGrid className="h-4 w-4" aria-hidden="true" />
            دسته‌بندی:
          </span>
          {courseCategories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
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

      <p className="mt-6 text-[13px] text-ink-500">
        {filtered.length > 0
          ? `${new Intl.NumberFormat('fa-IR').format(filtered.length)} دوره یافت شد`
          : 'دوره‌ای یافت نشد'}
      </p>

      {filtered.length > 0 ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>
      ) : (
        <div className="mt-6 grid place-items-center rounded-[26px] border border-dashed border-cloud-400 bg-cloud-100 px-6 py-20 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-white text-ink-400 shadow-card">
            <Search className="h-7 w-7" aria-hidden="true" />
          </span>
          <h3 className="mt-5 text-lg font-extrabold text-navy-900">دوره‌ای با این مشخصات پیدا نشد</h3>
          <p className="mt-2 max-w-sm text-[13.5px] leading-7 text-ink-500">
            عبارت جستجو یا دسته‌بندی را تغییر دهید تا دوره‌های بیشتری ببینید.
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
    </div>
  );
}
