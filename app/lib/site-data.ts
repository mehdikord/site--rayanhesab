/**
 * Server-only data access for the public site.
 * Maps the pre-designed MySQL database (via Prisma) into the plain
 * `app/types` shapes consumed by the site components.
 *
 * Every function returns JSON-serializable values (no BigInt/Date), so
 * results can be passed as props to client components.
 */
import { prisma } from '@/app/lib/prisma';
import { sanitizeArticleHtml } from '@/app/lib/sanitize';
import type { Service, Course, Article, TeamMember } from '@/app/types';

/** Shown when a record has no image of its own. */
export const FALLBACK_IMAGE = '/images/og-default.jpg';

/**
 * next/image only accepts local paths here (no remotePatterns are configured,
 * to avoid an open image proxy), so anything else falls back.
 */
function safeImage(src: string | null | undefined, fallback = FALLBACK_IMAGE): string {
  const v = (src ?? '').trim();
  return v.startsWith('/') && !v.startsWith('//') ? v : fallback;
}

/* ─────────────────────────── Settings ─────────────────────────── */

/** Raw key → value map of all settings (null values omitted). */
export async function getPublicSettings(): Promise<Record<string, string>> {
  const rows = await prisma.setting.findMany();
  const map: Record<string, string> = {};
  for (const r of rows) {
    if (r.value !== null) map[r.key] = r.value;
  }
  return map;
}

export interface SiteSettings {
  siteName: string;
  siteTagline: string;
  siteUrl: string;
  footerAbout: string;
  phone: string;
  phoneLink: string;
  email: string;
  address: string;
  workingHours: string;
  telegram: string;
  instagram: string;
  linkedin: string;
  whatsapp: string;
  /** VAT rate in percent, used at checkout. */
  vatRate: number;
  seoTitle: string;
  seoDescription: string;
}

const SETTINGS_DEFAULTS: SiteSettings = {
  siteName: 'رایان حساب صبا',
  siteTagline: '',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rayan.example.com',
  footerAbout:
    'همراه مطمئن کسب‌وکار شما در مسیر رشد مالی؛ از خدمات تخصصی حسابداری و مالیاتی تا آموزش حرفه‌ای و جذب نیروی متخصص.',
  phone: '۰۲۱ ۰۰۰۰ ۰۰۰۰',
  phoneLink: 'tel:+982100000000',
  email: 'info@example.com',
  address: 'آدرس دفتر مرکزی به‌زودی اعلام می‌شود.',
  workingHours: 'شنبه تا چهارشنبه، ۹ تا ۱۷',
  telegram: '',
  instagram: '',
  linkedin: '',
  whatsapp: '',
  vatRate: 10,
  seoTitle: 'رایان حساب صبا | مشاوره مالی، حسابداری، مالیاتی و آموزش',
  seoDescription:
    'ارائه خدمات تخصصی حسابداری، حسابرسی، مشاوره مالیاتی، آموزش حسابداری و جذب نیروی متخصص حسابداری برای کسب‌وکارهای شما.',
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const map = await getPublicSettings();
  const num = (key: string, fallback: number): number => {
    const raw = map[key];
    if (raw === undefined) return fallback;
    const n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
  };
  return {
    ...SETTINGS_DEFAULTS,
    siteName: map.site_name ?? SETTINGS_DEFAULTS.siteName,
    siteTagline: map.site_tagline ?? SETTINGS_DEFAULTS.siteTagline,
    siteUrl: map.site_url ?? SETTINGS_DEFAULTS.siteUrl,
    footerAbout: map.footer_about ?? SETTINGS_DEFAULTS.footerAbout,
    phone: map.contact_phone ?? SETTINGS_DEFAULTS.phone,
    phoneLink: map.contact_phone_link ?? SETTINGS_DEFAULTS.phoneLink,
    email: map.contact_email ?? SETTINGS_DEFAULTS.email,
    address: map.contact_address ?? SETTINGS_DEFAULTS.address,
    workingHours: map.contact_working_hours ?? SETTINGS_DEFAULTS.workingHours,
    telegram: map.social_telegram ?? '',
    instagram: map.social_instagram ?? '',
    linkedin: map.social_linkedin ?? '',
    whatsapp: map.social_whatsapp ?? '',
    vatRate: num('vat_rate', SETTINGS_DEFAULTS.vatRate),
    seoTitle: map.seo_default_title ?? SETTINGS_DEFAULTS.seoTitle,
    seoDescription: map.seo_default_description ?? SETTINGS_DEFAULTS.seoDescription,
  };
}

/* ─────────────────────────── Services ─────────────────────────── */

type ServiceRows = Awaited<ReturnType<typeof fetchServices>>;

async function fetchServices() {
  return prisma.service.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    include: {
      features: { orderBy: { sortOrder: 'asc' } },
      steps: { orderBy: { sortOrder: 'asc' } },
      faqs: { orderBy: { sortOrder: 'asc' } },
      relatedAsSource: {
        orderBy: { sortOrder: 'asc' },
        select: { relatedService: { select: { id: true, slug: true } } },
      },
    },
  });
}

function mapService(
  s: ServiceRows[number],
  relatedSlugs: string[],
): Service {
  const byType = (type: string) =>
    s.features.filter((f) => f.type === type).map((f) => f.title);
  return {
    slug: s.slug,
    title: s.title,
    short: s.shortTitle ?? '',
    excerpt: s.excerpt ?? '',
    icon: s.icon ?? 'Calculator',
    image: safeImage(s.image),
    accent: s.accent ?? 'from-brand-600 to-navy-800',
    problems: byType('problem'),
    scope: s.features
      .filter((f) => f.type === 'scope')
      .map((f) => ({ title: f.title, description: f.description ?? '' })),
    benefits: byType('benefit'),
    process: s.steps.map((st, i) => ({
      step: new Intl.NumberFormat('fa-IR').format(i + 1),
      title: st.title,
      description: st.description ?? '',
    })),
    audience: byType('audience'),
    faqs: s.faqs.map((f) => ({ q: f.question, a: f.answer })),
    related: relatedSlugs,
  };
}

/** Related slugs per service, limited to services that are themselves active. */
function resolveRelatedSlugs(rows: ServiceRows): Map<bigint, string[]> {
  const byId = new Map<bigint, string>(rows.map((r) => [r.id, r.slug]));
  return new Map(
    rows.map((r) => [
      r.id,
      r.relatedAsSource
        .map((rel) => byId.get(rel.relatedService.id) ?? '')
        .filter(Boolean),
    ]),
  );
}

/** Active services with full nested content (features, steps, faqs, related). */
export async function getServices(): Promise<Service[]> {
  const rows = await fetchServices();
  const related = resolveRelatedSlugs(rows);
  return rows.map((s) => mapService(s, related.get(s.id) ?? []));
}

export interface ServiceDetail {
  service: Service;
  related: Service[];
  metaTitle: string | null;
  metaDescription: string | null;
}

/** A single active service by slug, with its related services resolved. */
export async function getServiceDetail(slug: string): Promise<ServiceDetail | null> {
  const rows = await fetchServices();
  const row = rows.find((r) => r.slug === slug);
  if (!row) return null;
  const related = resolveRelatedSlugs(rows);
  const rowsById = new Map(rows.map((r) => [r.id, r]));
  // Keep the admin-defined order of related services.
  const relatedRows = row.relatedAsSource.flatMap((rel) => {
    const r = rowsById.get(rel.relatedService.id);
    return r ? [r] : [];
  });
  return {
    service: mapService(row, related.get(row.id) ?? []),
    related: relatedRows.map((r) => mapService(r, related.get(r.id) ?? [])),
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
  };
}

/* ─────────────────────────── Courses ─────────────────────────── */

type CourseRows = Awaited<ReturnType<typeof fetchCourses>>;

async function fetchCourses() {
  return prisma.course.findMany({
    where: { status: 'published' },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    include: {
      category: { select: { name: true } },
      instructor: { select: { name: true, title: true } },
      chapters: {
        orderBy: { sortOrder: 'asc' },
        include: { lessons: { orderBy: { sortOrder: 'asc' }, select: { title: true } } },
      },
      faqs: { orderBy: { sortOrder: 'asc' } },
      features: { orderBy: { sortOrder: 'asc' } },
      tags: { select: { tag: { select: { name: true } } } },
      relatedAsSource: {
        where: { relatedCourse: { status: 'published' } },
        orderBy: { sortOrder: 'asc' },
        select: {
          relatedCourse: {
            select: {
              slug: true,
              title: true,
              image: true,
              price: true,
              category: { select: { name: true } },
            },
          },
        },
      },
    },
  });
}

function mapCourse(c: CourseRows[number]): Course {
  const featuresOf = (type: string) =>
    c.features.filter((f) => f.type === type).map((f) => f.title);
  return {
    slug: c.slug,
    title: c.title,
    excerpt: c.excerpt ?? '',
    description: c.description ?? '',
    image: safeImage(c.image),
    category: c.category?.name ?? 'آموزش',
    instructor: c.instructor?.name ?? '',
    instructorRole: c.instructor?.title ?? '',
    duration: c.durationLabel ?? '',
    level: c.level ?? '',
    price: c.price,
    originalPrice: c.originalPrice ?? undefined,
    featured: c.isFeatured,
    tags: c.tags.map((t) => t.tag.name),
    objectives: featuresOf('objective'),
    audience: featuresOf('audience'),
    prerequisites: featuresOf('prerequisite'),
    curriculum: c.chapters.map((ch) => ({
      title: ch.title,
      duration: ch.durationLabel ?? '',
      lessons: ch.lessons.map((l) => l.title),
    })),
    faqs: c.faqs.map((f) => ({ q: f.question, a: f.answer })),
    related: c.relatedAsSource.map((r) => r.relatedCourse?.slug ?? '').filter(Boolean),
  };
}

/** Published courses (light shape, enough for cards & catalog filtering). */
export async function getCourses(): Promise<Course[]> {
  const rows = await fetchCourses();
  return rows.map((c) => mapCourse(c));
}

export interface CourseDetail {
  course: Course;
  related: Course[];
  metaTitle: string | null;
  metaDescription: string | null;
}

async function fetchCourseById(id: bigint) {
  return prisma.course.findUnique({
    where: { id },
    include: {
      category: { select: { name: true } },
      instructor: { select: { name: true, title: true } },
      chapters: {
        orderBy: { sortOrder: 'asc' },
        include: { lessons: { orderBy: { sortOrder: 'asc' }, select: { title: true } } },
      },
      faqs: { orderBy: { sortOrder: 'asc' } },
      features: { orderBy: { sortOrder: 'asc' } },
      tags: { select: { tag: { select: { name: true } } } },
      relatedAsSource: {
        where: { relatedCourse: { status: 'published' } },
        orderBy: { sortOrder: 'asc' },
        select: {
          relatedCourse: {
            select: {
              slug: true,
              title: true,
              image: true,
              price: true,
              category: { select: { name: true } },
            },
          },
        },
      },
    },
  });
}

/** A published course by slug plus its related courses. */
export async function getCourseDetail(slug: string): Promise<CourseDetail | null> {
  const found = await prisma.course.findFirst({
    where: { slug, status: 'published' },
    select: { id: true },
  });
  if (!found) return null;
  const c = await fetchCourseById(found.id);
  if (!c) return null;
  const related: Course[] = c.relatedAsSource.flatMap((r) => {
    const rc = r.relatedCourse;
    if (!rc) return [];
    return [
      {
        slug: rc.slug,
        title: rc.title,
        excerpt: '',
        description: '',
        image: safeImage(rc.image),
        category: rc.category?.name ?? 'آموزش',
        instructor: '',
        instructorRole: '',
        duration: '',
        level: '',
        price: rc.price,
        tags: [],
        objectives: [],
        audience: [],
        prerequisites: [],
        curriculum: [],
        faqs: [],
        related: [],
      },
    ];
  });
  const mapped = mapCourse(c);
  return {
    course: mapped,
    related,
    metaTitle: c.metaTitle,
    metaDescription: c.metaDescription,
  };
}

/** Category names for the course filter chips. */
export async function getCourseCategories(): Promise<string[]> {
  const cats = await prisma.courseCategory.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  });
  return cats.map((c) => c.name);
}

/* ─────────────────────────── Articles ─────────────────────────── */

function faDate(d: Date): string {
  return new Intl.DateTimeFormat('fa-IR', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
}

function estimateReadingTime(body: string | null): number {
  if (!body) return 5;
  const words = body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.round(words / 180));
}

async function fetchArticles() {
  return prisma.article.findMany({
    where: { status: 'published' },
    orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
    include: {
      articleCategory: { select: { name: true } },
      relatedAsSource: {
        orderBy: { sortOrder: 'asc' },
        select: { relatedArticle: { select: { id: true, slug: true } } },
      },
    },
  });
}

type ArticleBase = {
  slug: string;
  title: string;
  excerpt: string | null;
  image: string | null;
  readingTime: number | null;
  authorName: string | null;
  authorRole: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  body?: string | null;
  articleCategory: { name: string } | null;
};

function mapArticle(a: ArticleBase, body?: string | null, relatedSlugs: string[] = []): Article {
  return {
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt ?? '',
    image: safeImage(a.image),
    category: a.articleCategory?.name ?? '',
    date: faDate(a.publishedAt ?? a.createdAt),
    dateIso: (a.publishedAt ?? a.createdAt).toISOString(),
    readingTime: a.readingTime ?? estimateReadingTime(body ?? null),
    author: a.authorName ?? 'تیم رایان',
    authorRole: a.authorRole ?? '',
    body: body ?? undefined,
    related: relatedSlugs,
  };
}

/** Published articles (newest first), light shape for cards/explorer. */
export async function getArticles(): Promise<Article[]> {
  const rows = await fetchArticles();
  const byId = new Map<bigint, string>(rows.map((r) => [r.id, r.slug]));
  return rows.map((a) =>
    mapArticle(
      a,
      undefined,
      a.relatedAsSource.map((rel) => byId.get(rel.relatedArticle.id) ?? '').filter(Boolean),
    ),
  );
}

export interface ArticleDetail {
  article: Article;
  related: Article[];
  metaTitle: string | null;
  metaDescription: string | null;
}

async function fetchArticleById(id: bigint) {
  return prisma.article.findUnique({
    where: { id },
    include: {
      articleCategory: { select: { name: true } },
    },
  });
}

/** A published article by slug (with HTML body) plus related articles. */
export async function getArticleDetail(slug: string): Promise<ArticleDetail | null> {
  const found = await prisma.article.findFirst({
    where: { slug, status: 'published' },
    select: { id: true },
  });
  if (!found) return null;
  const a = await fetchArticleById(found.id);
  if (!a) return null;

  const [base, relLinks] = await Promise.all([
    fetchArticles(),
    prisma.articleRelated.findMany({
      where: { articleId: found.id },
      orderBy: { sortOrder: 'asc' },
      select: { relatedArticleId: true },
    }),
  ]);
  const byId = new Map<bigint, string>(base.map((r) => [r.id, r.slug]));
  const relatedSlugs = relLinks.map((l) => byId.get(l.relatedArticleId) ?? '').filter(Boolean);

  const article = mapArticle(a, a.body ? sanitizeArticleHtml(a.body) : null, relatedSlugs);
  const baseById = new Map(base.map((r) => [r.id, r]));
  const related = relLinks.flatMap((l) => {
    const r = baseById.get(l.relatedArticleId);
    return r ? [mapArticle(r)] : [];
  });

  return { article, related, metaTitle: a.metaTitle, metaDescription: a.metaDescription };
}

/** Count one view of a published article (best effort). */
export async function incrementArticleViews(slug: string): Promise<void> {
  try {
    await prisma.article.updateMany({
      where: { slug, status: 'published' },
      data: { viewsCount: { increment: 1 } },
    });
  } catch {
    // A failed counter update must never affect the page.
  }
}

/** Category names for the article filter chips. */
export async function getArticleCategories(): Promise<string[]> {
  const cats = await prisma.articleCategory.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  });
  return cats.map((c) => c.name);
}

/* ─────────────────────────── Team ─────────────────────────── */

/** Active team members in display order. */
export async function getTeam(): Promise<TeamMember[]> {
  const rows = await prisma.teamMember.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  });
  return rows.map((m) => ({
    slug: m.slug,
    name: m.name,
    role: m.role,
    expertise: m.expertise ?? '',
    image: safeImage(m.image, '/images/unsplash-1521737604893-d14cc237f11d-1600.jpg'),
    bio: m.bio ?? '',
  }));
}

/* ─────────────────────────── Checkout ─────────────────────────── */

export interface CheckoutData {
  course: Course;
  /** VAT rate in percent (e.g. 10 → ۱۰٪). */
  vatRatePercent: number;
}

/**
 * Everything a checkout page needs for a published course. Coupon codes are
 * never sent to the browser; they are validated server-side on apply/pay.
 */
export async function getCheckoutData(slug: string): Promise<CheckoutData | null> {
  const [detail, settings] = await Promise.all([getCourseDetail(slug), getSiteSettings()]);
  if (!detail) return null;
  return { course: detail.course, vatRatePercent: settings.vatRate };
}

/* ─────────────────────────── Sitemap ─────────────────────────── */

/** Published content slugs (articles with publish dates) for a dynamic sitemap. */
export async function getSitemapData(): Promise<{
  services: string[];
  courses: string[];
  articles: { slug: string; lastModified: string }[];
}> {
  const [services, courses, articles] = await Promise.all([
    prisma.service.findMany({ where: { isActive: true }, select: { slug: true } }),
    prisma.course.findMany({ where: { status: 'published' }, select: { slug: true } }),
    prisma.article.findMany({
      where: { status: 'published' },
      select: { slug: true, publishedAt: true, createdAt: true },
    }),
  ]);
  return {
    services: services.map((s) => s.slug),
    courses: courses.map((c) => c.slug),
    articles: articles.map((a) => ({
      slug: a.slug,
      lastModified: (a.publishedAt ?? a.createdAt).toISOString(),
    })),
  };
}
