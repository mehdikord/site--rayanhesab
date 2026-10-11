import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, Clock, UserRound, ChevronLeft, ArrowUpLeft } from 'lucide-react';
import { Container, Section, SectionHeading } from '@/app/components/ui/Section';
import { ButtonLink } from '@/app/components/ui/Button';
import { articles, getArticle } from '@/app/data/articles';
import { toFa } from '@/app/lib/utils';

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: 'مقاله یافت نشد' };
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/articles/${article.slug}` },
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.excerpt,
      images: [article.image],
      publishedTime: article.dateIso,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const related = article.related
    .map((s) => getArticle(s))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <article>
        <header className="relative overflow-hidden bg-navy-950 pt-[68px] text-white">
          <div className="absolute inset-0" aria-hidden="true">
            <Image src={article.image} alt="" fill sizes="100vw" className="object-cover opacity-25" priority />
            <div className="absolute inset-0 bg-gradient-to-l from-navy-950 via-navy-950/85 to-navy-950/70" />
          </div>
          <div className="pointer-events-none absolute inset-0 ledger-grid-light opacity-30" aria-hidden="true" />
          <Container className="relative py-16 sm:py-20">
            <nav aria-label="مسیر صفحه" className="flex flex-wrap items-center gap-2 text-[13px]">
              <Link href="/" className="text-white/55 hover:text-white">خانه</Link>
              <ChevronLeft className="h-3.5 w-3.5 text-white/30" aria-hidden="true" />
              <Link href="/articles" className="text-white/55 hover:text-white">مقالات</Link>
              <ChevronLeft className="h-3.5 w-3.5 text-white/30" aria-hidden="true" />
              <span className="font-semibold text-white">{article.category}</span>
            </nav>
            <span className="mt-6 inline-flex rounded-full bg-brand-500/20 px-3 py-1 text-[12.5px] font-bold text-brand-200">
              {article.category}
            </span>
            <h1 className="mt-4 max-w-4xl text-balance text-3xl font-black leading-[1.4] sm:text-4xl lg:text-[46px]">
              {article.title}
            </h1>
            <p className="mt-5 max-w-3xl text-[15px] leading-9 text-white/65 sm:text-base">{article.excerpt}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] text-white/60">
              <span className="inline-flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10">
                  <UserRound className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="font-bold text-white">{article.author}</span>
                  <span className="text-[11.5px]">{article.authorRole}</span>
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" aria-hidden="true" /> {article.date}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" aria-hidden="true" /> {toFa(article.readingTime)} دقیقه مطالعه
              </span>
            </div>
          </Container>
        </header>

        <Section className="bg-white">
          <Container className="max-w-3xl">
            <div className="prose-r with prose-lg max-w-none">
              {article.content.map((block, i) => (
                <div key={i} className={i > 0 ? 'mt-10' : ''}>
                  {block.heading && (
                    <h2 className="text-xl font-black leading-[1.6] text-navy-900 sm:text-2xl">{block.heading}</h2>
                  )}
                  {block.paragraphs.map((p, j) => (
                    <p key={j} className="mt-4 text-[15.5px] leading-9 text-ink-700">
                      {p}
                    </p>
                  ))}
                  {block.list && (
                    <ul className="mt-5 space-y-3 border-r-2 border-brand-200 pr-5">
                      {block.list.map((item) => (
                        <li key={item} className="text-[14.5px] leading-8 text-ink-700">
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-cloud-300 pt-8">
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-bold text-ink-500">اشتراک‌گذاری:</span>
                {['کپی لینک', 'تلگرام', 'لینکدین'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="rounded-full border border-cloud-300 bg-cloud-100 px-4 py-2 text-[12.5px] font-semibold text-ink-600 transition-colors hover:border-brand-200 hover:text-brand-600"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <Link
                href="/consultation"
                className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-6 py-3 text-[13px] font-bold text-white transition-colors hover:bg-brand-600"
              >
                دریافت مشاوره مالی
                <ArrowUpLeft className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </Container>
        </Section>

        <Section className="bg-cloud-100">
          <Container>
            <div className="rounded-[30px] border border-brand-100 bg-brand-50 p-7 text-center sm:p-10">
              <h2 className="text-balance text-xl font-black text-navy-900 sm:text-2xl">
                سوالی درباره این موضوع دارید؟
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-[14px] leading-8 text-ink-600">
                کارشناسان رایان آماده‌اند تا درباره موضوعات مالی و مالیاتی کسب‌وکار شما راهنمایی کنند.
              </p>
              <div className="mt-6 flex justify-center">
                <ButtonLink href="/consultation" variant="primary" size="md">
                  درخواست مشاوره رایگان
                </ButtonLink>
              </div>
            </div>
          </Container>
        </Section>

        {related.length > 0 && (
          <Section className="bg-white">
            <Container>
              <SectionHeading eyebrow="ادامه مطالعه" title="مقالات مرتبط" />
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/articles/${r.slug}`}
                    className="group overflow-hidden rounded-[24px] border border-cloud-300 bg-white shadow-card transition-all duration-400 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift"
                  >
                    <div className="img-frame relative aspect-[16/10]">
                      <Image src={r.image} alt={r.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                    </div>
                    <div className="p-5">
                      <span className="text-[11.5px] font-bold text-brand-600">{r.category}</span>
                      <h3 className="mt-1.5 line-clamp-2 text-[14.5px] font-bold leading-7 text-navy-900 transition-colors group-hover:text-brand-600">
                        {r.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </Container>
          </Section>
        )}
      </article>
    </div>
  );
}
