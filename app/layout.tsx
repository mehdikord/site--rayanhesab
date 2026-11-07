import localFont from 'next/font/local';
import type { Metadata } from 'next';
import { getSiteSettings } from '@/app/lib/site-data';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rayan.example.com';

// Self-hosted Vazirmatn (variable, weights 100–900) from the `vazirmatn`
// package: no dependency on Google Fonts at build time or for visitors.
const vazirmatn = localFont({
  src: './fonts/Vazirmatn-Variable.woff2',
  variable: '--font-vazirmatn',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  preload: true,
  fallback: ['Tahoma', 'sans-serif'],
});

/** Static defaults; DB-driven SEO settings are layered on top below. */
const baseMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'رایان حساب صبا | مشاوره مالی، حسابداری، مالیاتی و آموزش',
    template: '%s | رایان حساب صبا',
  },
  description: 'ارائه خدمات تخصصی حسابداری، حسابرسی، مشاوره مالیاتی، آموزش حسابداری و جذب نیروی متخصص حسابداری برای کسب‌وکارهای شما.',
  keywords: ['حسابداری', 'حسابرسی', 'مالیات', 'مشاوره مالی', 'آموزش حسابداری', 'جذب حسابدار', 'رایان'],
  authors: [{ name: 'رایان حساب صبا' }],
  creator: 'رایان حساب صبا',
  publisher: 'رایان حساب صبا',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    url: siteUrl,
    siteName: 'رایان حساب صبا',
    title: 'رایان حساب صبا | مشاوره مالی، حسابداری، مالیاتی و آموزش',
    description: 'همراه مطمئن کسب‌وکار شما در مسیر رشد مالی با خدمات تخصصی حسابداری، مالیاتی و آموزشی.',
    images: [
      {
        url: '/images/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'رایان حساب صبا',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'رایان حساب صبا',
    description: 'مشاوره مالی، حسابداری، مالیاتی و آموزش تخصصی',
    images: ['/images/og-default.jpg'],
  },
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
};

/** Root metadata overrides driven by the SEO settings in the database. */
export async function generateMetadata(): Promise<Metadata> {
  let s;
  try {
    s = await getSiteSettings();
  } catch {
    s = undefined;
  }
  if (!s) return baseMetadata;
  const name = s.siteName;
  return {
    ...baseMetadata,
    title: {
      default: s.seoTitle,
      template: `%s | ${name}`,
    },
    description: s.seoDescription,
    authors: [{ name }],
    creator: name,
    publisher: name,
    openGraph: {
      ...baseMetadata.openGraph,
      url: s.siteUrl,
      siteName: name,
      title: s.seoTitle,
      description: s.seoDescription,
    },
    twitter: {
      ...baseMetadata.twitter,
      title: name,
      description: s.seoDescription,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}