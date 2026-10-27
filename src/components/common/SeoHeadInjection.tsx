import React from 'react';
import { getPageSeo, getFullSeoConfig } from '@/lib/seo-db';

interface SeoHeadInjectionProps {
  pathname: string;
}

export default function SeoHeadInjection({ pathname }: SeoHeadInjectionProps) {
  const seo = getPageSeo(pathname);
  const fullConfig = getFullSeoConfig();
  const global = fullConfig.global;
  const org = global.organization;

  // 1. Organization Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: org?.name || global.siteName,
    legalName: org?.legalName || global.siteName,
    url: org?.url || global.siteUrl,
    logo: org?.logo || global.ogImage,
    telephone: org?.telephone || '+91-98880-21000',
    email: org?.email || 'sales@cbh.store',
    vatID: org?.gstin || undefined,
    taxID: org?.gstin || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: org?.streetAddress || 'Industrial Focal Point Phase VIII',
      addressLocality: org?.addressLocality || 'Ludhiana',
      addressRegion: org?.addressRegion || 'Punjab',
      postalCode: org?.postalCode || '141010',
      addressCountry: org?.addressCountry || 'IN',
    },
    sameAs: org?.sameAs && org.sameAs.length > 0 ? org.sameAs : undefined,
  };

  // 2. WebSite Schema
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: global.siteName,
    url: global.siteUrl || 'https://cbh.store',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${global.siteUrl || 'https://cbh.store'}/products?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  // 3. FAQPage Schema (Per-page FAQs take precedence, else fallback to global FAQs)
  const faqs = seo.faqs && seo.faqs.length > 0 ? seo.faqs : global.globalFaqs;
  const hasFaqs = Array.isArray(faqs) && faqs.length > 0;

  const faqSchema = hasFaqs
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.answer,
          },
        })),
      }
    : null;

  return (
    <>
      {/* Search Engine Verification Tags in Head */}
      {global.googleVerification && (
        <meta name="google-site-verification" content={global.googleVerification} />
      )}
      {global.bingVerification && (
        <meta name="msvalidate.01" content={global.bingVerification} />
      )}
      {global.yandexVerification && (
        <meta name="yandex-verification" content={global.yandexVerification} />
      )}
      {global.themeColor && <meta name="theme-color" content={global.themeColor} />}
      {global.author && <meta name="author" content={global.author} />}
      {global.publisher && <meta name="publisher" content={global.publisher} />}

      {/* Schema.org Organization Structured Data */}
      <script
        type="application/ld+json"
        id="schema-organization"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      {/* Schema.org WebSite Structured Data */}
      <script
        type="application/ld+json"
        id="schema-website"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      {/* Schema.org FAQPage Structured Data (Dynamic On-Page / Global) */}
      {faqSchema && (
        <script
          type="application/ld+json"
          id="schema-faqs"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* Global custom head tags (e.g. analytics, custom meta tags) */}
      {global.customHeadTags && (
        <span
          dangerouslySetInnerHTML={{ __html: global.customHeadTags }}
          style={{ display: 'none' }}
        />
      )}

      {/* Page-level custom head code */}
      {seo.customHeadCode && (
        <span
          dangerouslySetInnerHTML={{ __html: seo.customHeadCode }}
          style={{ display: 'none' }}
        />
      )}
    </>
  );
}
