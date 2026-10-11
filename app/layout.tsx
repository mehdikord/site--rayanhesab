import { Vazirmatn } from 'next/font/google';
import type { Metadata } from 'next';
import './globals.css';
import { Navigation } from '@/app/components/layout/Navigation';
import { Footer } from '@/app/components/layout/Footer';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rayan.example.com';

const vazirmatn = Vazirmatn({
  subsets: ['arabic', 'latin'],
  variable: '--font-vazirmatn',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
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
    url: 'https://rayan-accounting.ir',
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
  verification: {
    google: 'google-site-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className="antialiased">
        <Navigation />
        {children}
        <Footer />
      </body>
    </html>
  );
}