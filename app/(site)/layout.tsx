import { Navigation } from '@/app/components/layout/Navigation';
import { Footer } from '@/app/components/layout/Footer';
import { getServices, getSiteSettings } from '@/app/lib/site-data';

export const dynamic = 'force-dynamic';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, services] = await Promise.all([getSiteSettings(), getServices()]);

  const navServices = services.map((s) => ({
    title: s.title,
    short: s.short,
    slug: s.slug,
  }));

  return (
    <>
      <Navigation
        siteName={settings.siteName}
        phone={settings.phone}
        phoneLink={settings.phoneLink}
        email={settings.email}
        services={navServices}
      />
      <main>{children}</main>
      <Footer settings={settings} services={services} />
    </>
  );
}
