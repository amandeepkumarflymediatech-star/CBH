import fs from 'fs';
import path from 'path';
import {
  FullSeoConfig,
  GlobalSeoConfig,
  PageSeoConfig,
  RobotsTxtConfig,
  LlmsTxtConfig,
  SitemapConfig,
  FaqItem,
} from './seo-types';
import { query } from './db';
import { ALL_STATIC_PRODUCTS } from './catalog-products-all';

const SEO_CONFIG_FILE = path.join(process.cwd(), 'src', 'data', 'seo-config.json');

let memoryConfig: FullSeoConfig | null = null;

// Read JSON file safely
function loadConfigFile(): FullSeoConfig {
  try {
    if (fs.existsSync(SEO_CONFIG_FILE)) {
      const raw = fs.readFileSync(SEO_CONFIG_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && parsed.global && parsed.pages) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[SEO DB] Error reading seo-config.json:', err);
  }

  // Fallback defaults if file doesn't exist
  return {
    global: {
      siteName: 'CBH Fasteners',
      siteUrl: 'https://cbh.store',
      defaultTitle: "CBH Fasteners | India's Premier Digital Fastener Procurement Platform",
      titleTemplate: '%s | CBH Fasteners',
      defaultDescription: '2 Lacs+ SKUs under one roof. BIS Certified DIN & ISO precision fasteners.',
      defaultKeywords: 'fasteners, hex screws, DIN 933, bolts, anchors, BIS certified fasteners',
      canonicalBase: 'https://cbh.store',
      author: 'CBH Tech Pvt. Ltd.',
      publisher: 'CBH Fasteners',
      themeColor: '#0F172A',
      ogImage: '/assets/cbh-logo-icon.png',
      ogType: 'website',
      twitterCard: 'summary_large_image',
      twitterHandle: '@cbhfasteners',
      googleVerification: '',
      bingVerification: '',
      customHeadTags: '',
      organization: {
        name: 'CBH Fasteners',
        legalName: 'CBH Tech Private Limited',
        url: 'https://cbh.store',
        logo: 'https://cbh.store/assets/cbh-logo-icon.png',
        telephone: '+91-98880-21000',
        email: 'sales@cbh.store',
        gstin: '03AAACC1206M1ZN',
        streetAddress: 'Industrial Focal Point Phase VIII',
        addressLocality: 'Ludhiana',
        addressRegion: 'Punjab',
        postalCode: '141010',
        addressCountry: 'IN',
      },
      globalFaqs: [],
    },
    pages: [],
    robots: {
      content: 'User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /customer\nSitemap: https://cbh.store/sitemap.xml\n',
      autoSitemap: true,
    },
    llms: {
      content: '# CBH Fasteners\nIndia premier digital fastener procurement platform.',
    },
    sitemap: {
      includeProducts: true,
      includeCategories: true,
      additionalUrls: [],
    },
  };
}

/**
 * Get Full SEO Configuration
 */
export function getFullSeoConfig(): FullSeoConfig {
  if (!memoryConfig) {
    memoryConfig = loadConfigFile();
  }
  return memoryConfig;
}

/**
 * Persist SEO Configuration to file and MySQL (if connected)
 */
export function saveFullSeoConfig(config: FullSeoConfig): FullSeoConfig {
  config.lastUpdated = new Date().toISOString();
  memoryConfig = config;

  try {
    const dir = path.dirname(SEO_CONFIG_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SEO_CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } catch (err) {
    console.error('[SEO DB] Failed saving seo-config.json:', err);
  }

  // Background MySQL sync if available
  query(`
    CREATE TABLE IF NOT EXISTS seo_settings (
      id INT PRIMARY KEY DEFAULT 1,
      config_json LONGTEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `)
    .then(() => {
      return query(
        `INSERT INTO seo_settings (id, config_json) VALUES (1, ?) ON DUPLICATE KEY UPDATE config_json = VALUES(config_json)`,
        [JSON.stringify(config)]
      );
    })
    .catch(() => {
      // Ignore if MySQL is not connected or in standalone dev mode
    });

  return config;
}

/**
 * Lookup dynamic SEO for a given route/pathname
 */
export function getPageSeo(pathname: string): {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  robots: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  faqs: FaqItem[];
  customHeadCode?: string;
  siteName: string;
} {
  const config = getFullSeoConfig();
  const global = config.global;

  // Normalize path
  const normalized = pathname.trim().replace(/\/$/, '') || '/';

  // Exact match
  let matched = config.pages.find((p) => {
    const pNorm = p.path.trim().replace(/\/$/, '') || '/';
    return pNorm === normalized;
  });

  // Prefix match (for product or category subpages like /products/...)
  if (!matched && normalized.startsWith('/products/')) {
    matched = config.pages.find((p) => p.path === '/products');
  }

  if (matched) {
    return {
      title: matched.title || global.defaultTitle,
      description: matched.description || global.defaultDescription,
      keywords: matched.keywords || global.defaultKeywords,
      canonicalUrl: matched.canonicalUrl || `${global.canonicalBase}${normalized === '/' ? '' : normalized}`,
      robots: matched.robots || 'index, follow',
      ogTitle: matched.ogTitle || matched.title || global.defaultTitle,
      ogDescription: matched.ogDescription || matched.description || global.defaultDescription,
      ogImage: matched.ogImage || global.ogImage,
      faqs: (matched.faqs && matched.faqs.length > 0) ? matched.faqs : global.globalFaqs,
      customHeadCode: matched.customHeadCode,
      siteName: global.siteName,
    };
  }

  // Automatic default generation for unconfigured routes
  const cleanName = normalized
    .replace(/^\//, '')
    .split(/[-_/]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ') || 'Platform';

  return {
    title: `${cleanName} | ${global.siteName}`,
    description: global.defaultDescription,
    keywords: global.defaultKeywords,
    canonicalUrl: `${global.canonicalBase}${normalized === '/' ? '' : normalized}`,
    robots: 'index, follow',
    ogTitle: `${cleanName} | ${global.siteName}`,
    ogDescription: global.defaultDescription,
    ogImage: global.ogImage,
    faqs: global.globalFaqs,
    siteName: global.siteName,
  };
}

/**
 * Get Robots.txt content
 */
export function getRobotsTxtContent(): string {
  const config = getFullSeoConfig();
  let content = config.robots?.content;

  if (!content) {
    content = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /customer\nSitemap: ${config.global.canonicalBase || 'https://cbh.store'}/sitemap.xml\n`;
  }

  return content;
}

/**
 * Get llms.txt content
 */
export function getLlmsTxtContent(): string {
  const config = getFullSeoConfig();
  return config.llms?.content || '# CBH Fasteners\nDigital Fastener Procurement Platform';
}

/**
 * Generate XML Sitemap string
 */
export function generateSitemapXml(): string {
  const config = getFullSeoConfig();
  const baseUrl = config.global.canonicalBase || 'https://cbh.store';
  const lastmodNow = new Date().toISOString().split('T')[0];

  const urlMap = new Map<string, { changefreq: string; priority: number; lastmod: string }>();

  // 1. Pages from config
  for (const page of config.pages) {
    if (page.robots?.includes('noindex')) continue;
    const fullUrl = page.canonicalUrl || `${baseUrl}${page.path === '/' ? '' : page.path}`;
    urlMap.set(fullUrl, {
      changefreq: page.path === '/' ? 'daily' : 'weekly',
      priority: page.path === '/' ? 1.0 : 0.8,
      lastmod: page.updatedAt ? page.updatedAt.split('T')[0] : lastmodNow,
    });
  }

  // 2. Additional URLs from sitemap config
  if (config.sitemap?.additionalUrls) {
    for (const item of config.sitemap.additionalUrls) {
      urlMap.set(item.url, {
        changefreq: item.changefreq || 'weekly',
        priority: item.priority ?? 0.7,
        lastmod: item.lastmod || lastmodNow,
      });
    }
  }

  // 3. Auto include catalog products if enabled
  if (config.sitemap?.includeProducts !== false) {
    const products = ALL_STATIC_PRODUCTS.slice(0, 500); // Index top 500 catalog items
    for (const p of products) {
      const prodUrl = `${baseUrl}/product/${p.sku.toLowerCase()}`;
      if (!urlMap.has(prodUrl)) {
        urlMap.set(prodUrl, {
          changefreq: 'monthly',
          priority: 0.6,
          lastmod: lastmodNow,
        });
      }
    }
  }

  // Build XML
  const entries: string[] = [];
  urlMap.forEach((meta, loc) => {
    entries.push(`  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${meta.lastmod}</lastmod>
    <changefreq>${meta.changefreq}</changefreq>
    <priority>${meta.priority.toFixed(2)}</priority>
  </url>`);
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
