import { NextRequest, NextResponse } from 'next/server';
import { getFullSeoConfig, saveFullSeoConfig } from '@/lib/seo-db';
import { FullSeoConfig } from '@/lib/seo-types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = getFullSeoConfig();
    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch SEO configuration' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || !body.global) {
      return NextResponse.json(
        { success: false, error: 'Invalid SEO payload: global settings required' },
        { status: 400 }
      );
    }

    const current = getFullSeoConfig();
    const updated: FullSeoConfig = {
      global: { ...current.global, ...(body.global || {}) },
      pages: Array.isArray(body.pages) ? body.pages : current.pages,
      robots: { ...current.robots, ...(body.robots || {}) },
      llms: { ...current.llms, ...(body.llms || {}) },
      sitemap: { ...current.sitemap, ...(body.sitemap || {}) },
      lastUpdated: new Date().toISOString(),
    };

    const saved = saveFullSeoConfig(updated);

    return NextResponse.json({
      success: true,
      message: 'SEO configuration saved successfully',
      data: saved,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save SEO configuration' },
      { status: 500 }
    );
  }
}
