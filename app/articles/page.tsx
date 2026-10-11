import type { Metadata } from 'next';
import { Container, Section } from '@/app/components/ui/Section';
import { PageHero } from '@/app/components/ui/PageHero';
import { ArticleCard } from '@/app/components/ui/cards';
import { articles } from '@/app/data/articles';
import { ArticlesExplorer } from './ArticlesExplorer';

export const metadata: Metadata = {
  title: 'مقالات و دانش مالی',
  description:
    'مقالات کاربردی درباره مالیات، حسابداری، مدیریت مالی، حسابرسی و رشد حرفه‌ای؛ راهنمایی برای تصمیم‌های مالی بهتر.',
  alternates: { canonical: '/articles' },
};

export default function ArticlesPage() {
  const featured = articles[0];

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PageHero
        compact
        eyebrow="دانش مالی"
        title="مقالات و راهنمای مالی"
        description="محتوای کاربردی درباره مالیات، حسابداری، مدیریت مالی و رشد حرفه‌ای برای مدیران و حسابداران."
        breadcrumbs={[{ label: 'مقالات' }]}
        image="/images/unsplash-1450101499163-c8848c66ca85-1600.jpg"
      />

      <main className="flex-1">
        <Section className="bg-white">
          <Container>
            <ArticleCard article={featured} featured />
          </Container>
        </Section>

        <Section className="bg-cloud-100 pt-0 sm:pt-0 lg:pt-0">
          <Container>
            <ArticlesExplorer />
          </Container>
        </Section>
      </main>
    </div>
  );
}
