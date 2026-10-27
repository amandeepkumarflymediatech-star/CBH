import { NextResponse } from 'next/server';
import { generateSitemapXml } from '@/lib/seo-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const xml = generateSitemapXml();
  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate',
    },
  });
}
