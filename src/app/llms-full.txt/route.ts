import { NextResponse } from 'next/server';
import { getLlmsFullTxtContent } from '@/lib/seo-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const content = getLlmsFullTxtContent();
  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate',
    },
  });
}
