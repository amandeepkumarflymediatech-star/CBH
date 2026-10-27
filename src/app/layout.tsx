import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import './globals.css';
import TopOpsBar from '@/components/header/TopOpsBar';
import IndustrialFooter from '@/components/footer/IndustrialFooter';
import SeoHeadInjection from '@/components/common/SeoHeadInjection';
import { getPageSeo, getFullSeoConfig } from '@/lib/seo-db';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export async function generateMetadata(): Promise<Metadata> {
  let pathname = '/';
  try {
    const headersList = headers();
    pathname = headersList.get('x-pathname') || '/';
  } catch {
    // Fallback if headers cannot be read
  }

  const seo = getPageSeo(pathname);
  const fullConfig = getFullSeoConfig();
  const global = fullConfig.global;
  const baseUrl = global.canonicalBase || 'https://cbh.store';

  return {
    metadataBase: new URL(baseUrl),
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical: seo.canonicalUrl || `${baseUrl}${pathname === '/' ? '' : pathname}`,
    },
    robots: seo.robots || 'index, follow',
    openGraph: {
      title: seo.ogTitle || seo.title,
      description: seo.ogDescription || seo.description,
      url: seo.canonicalUrl || `${baseUrl}${pathname === '/' ? '' : pathname}`,
      siteName: global.siteName,
      images: [
        {
          url: seo.ogImage || global.ogImage || '/assets/cbh-logo-icon.png',
          width: 1200,
          height: 630,
          alt: seo.title,
        },
      ],
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: global.twitterCard || 'summary_large_image',
      title: seo.ogTitle || seo.title,
      description: seo.ogDescription || seo.description,
      creator: global.twitterHandle,
      images: [seo.ogImage || global.ogImage || '/assets/cbh-logo-icon.png'],
    },
    verification: {
      google: global.googleVerification || undefined,
      yandex: global.yandexVerification || undefined,
      other: global.bingVerification ? { 'msvalidate.01': global.bingVerification } : undefined,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let pathname = '/';
  try {
    const headersList = headers();
    pathname = headersList.get('x-pathname') || '/';
  } catch {
    // Fallback during static analysis
  }

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/assets/cbh-logo-icon.png" type="image/png" />

        {/* Dynamic SEO & Schema placed strictly in <head> tag */}
        <SeoHeadInjection pathname={pathname} />
      </head>
      <body>
        <TopOpsBar />
        {children}
        <IndustrialFooter />
      </body>
    </html>
  );
}
