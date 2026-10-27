import { NextRequest, NextResponse } from 'next/server';
import { getFullSeoConfig, saveFullSeoConfig } from '@/lib/seo-db';
import { PageSeoConfig } from '@/lib/seo-types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const pageData: PageSeoConfig = await req.json();

    if (!pageData || !pageData.path || !pageData.title) {
      return NextResponse.json(
        { success: false, error: 'Path and Meta Title are required for On-Page SEO' },
        { status: 400 }
      );
    }

    const config = getFullSeoConfig();
    const normalizedPath = pageData.path.trim().replace(/\/$/, '') || '/';
    pageData.path = normalizedPath;
    pageData.id = pageData.id || `page-${Date.now()}`;
    pageData.updatedAt = new Date().toISOString();

    const existingIdx = config.pages.findIndex(
      (p) => p.id === pageData.id || p.path.trim().replace(/\/$/, '') === normalizedPath
    );

    if (existingIdx >= 0) {
      config.pages[existingIdx] = { ...config.pages[existingIdx], ...pageData };
    } else {
      config.pages.push(pageData);
    }

    saveFullSeoConfig(config);

    return NextResponse.json({
      success: true,
      message: `On-page SEO for ${normalizedPath} updated successfully`,
      data: pageData,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update page SEO' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const path = searchParams.get('path');

    if (!id && !path) {
      return NextResponse.json(
        { success: false, error: 'Page ID or Path required for deletion' },
        { status: 400 }
      );
    }

    const config = getFullSeoConfig();
    const initialCount = config.pages.length;

    config.pages = config.pages.filter((p) => {
      if (id && p.id === id) return false;
      if (path && p.path.trim().replace(/\/$/, '') === path.trim().replace(/\/$/, '')) return false;
      return true;
    });

    if (config.pages.length === initialCount) {
      return NextResponse.json(
        { success: false, error: 'Page not found' },
        { status: 404 }
      );
    }

    saveFullSeoConfig(config);

    return NextResponse.json({
      success: true,
      message: 'Page SEO deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete page SEO' },
      { status: 500 }
    );
  }
}
