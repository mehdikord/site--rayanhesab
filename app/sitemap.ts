import type { MetadataRoute } from 'next';
import { getSitemapData } from '@/app/lib/site-data';

export const dynamic = 'force-dynamic';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rayan.example.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { services, courses, articles } = await getSitemapData();

  const staticRoutes = [
    { url: '/', priority: 1 },
    { url: '/services', priority: 0.9 },
    { url: '/courses', priority: 0.9 },
    { url: '/recruitment', priority: 0.8 },
    { url: '/recruitment/accountant', priority: 0.6 },
    { url: '/recruitment/employer', priority: 0.6 },
    { url: '/articles', priority: 0.8 },
    { url: '/about', priority: 0.7 },
    { url: '/team', priority: 0.6 },
    { url: '/contact', priority: 0.7 },
    { url: '/consultation', priority: 0.9 },
  ].map((r) => ({
    url: `${baseUrl}${r.url}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: r.priority,
  }));

  const serviceRoutes = services.map((slug) => ({
    url: `${baseUrl}/services/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const courseRoutes = courses.map((slug) => ({
    url: `${baseUrl}/courses/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }));

  const articleRoutes = articles.map((a) => ({
    url: `${baseUrl}/articles/${a.slug}`,
    lastModified: new Date(a.lastModified),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...serviceRoutes, ...courseRoutes, ...articleRoutes];
}
