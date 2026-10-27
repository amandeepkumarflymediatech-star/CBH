export interface FaqItem {
  id?: string;
  question: string;
  answer: string;
}

export interface PageSeoConfig {
  id: string;
  path: string; // e.g. '/', '/products', '/bulk-order', '/surplus', etc.
  pageName: string; // e.g. 'Home', 'Fastener Catalog'
  title: string;
  description: string;
  keywords: string;
  canonicalUrl?: string;
  robots?: 'index, follow' | 'noindex, follow' | 'noindex, nofollow' | 'index, nofollow';
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  faqs?: FaqItem[];
  customHeadCode?: string;
  updatedAt?: string;
}

export interface OrganizationSchemaConfig {
  name: string;
  legalName: string;
  url: string;
  logo: string;
  telephone: string;
  email: string;
  gstin?: string;
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: string;
  sameAs?: string[];
}

export interface GlobalSeoConfig {
  siteName: string;
  siteUrl: string;
  defaultTitle: string;
  titleTemplate: string; // e.g. '%s | CBH Fasteners'
  defaultDescription: string;
  defaultKeywords: string;
  canonicalBase: string;
  author: string;
  publisher: string;
  themeColor: string;
  ogImage: string;
  ogType: string;
  twitterCard: 'summary' | 'summary_large_image';
  twitterHandle: string;
  googleVerification: string;
  bingVerification: string;
  yandexVerification?: string;
  customHeadTags: string; // Custom HTML/scripts/meta to inject into <head>
  organization: OrganizationSchemaConfig;
  globalFaqs: FaqItem[];
}

export interface RobotsTxtConfig {
  content: string;
  autoSitemap: boolean;
}

export interface LlmsTxtConfig {
  content: string; // /llms.txt
}

export interface SitemapUrlItem {
  url: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  lastmod?: string;
}

export interface SitemapConfig {
  includeProducts: boolean;
  includeCategories: boolean;
  additionalUrls: SitemapUrlItem[];
}

export interface FullSeoConfig {
  global: GlobalSeoConfig;
  pages: PageSeoConfig[];
  robots: RobotsTxtConfig;
  llms: LlmsTxtConfig;
  sitemap: SitemapConfig;
  lastUpdated?: string;
}
