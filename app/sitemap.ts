import type { MetadataRoute } from 'next';
import { services } from '@/app/data/services';
import { courses } from '@/app/data/courses';
import { articles } from '@/app/data/articles';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rayan.example.com';

export default function sitemap(): MetadataRoute.Sitemap {
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

  const serviceRoutes = services.map((s) => ({
    url: `${baseUrl}/services/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const courseRoutes = courses.map((c) => ({
    url: `${baseUrl}/courses/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }));

  const articleRoutes = articles.map((a) => ({
    url: `${baseUrl}/articles/${a.slug}`,
    lastModified: new Date(a.dateIso),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...serviceRoutes, ...courseRoutes, ...articleRoutes];
}
