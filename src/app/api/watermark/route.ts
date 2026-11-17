import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { compositeWatermark } from '@/lib/watermark';
import { extractGoogleDriveId, fetchGoogleDriveImageBuffer } from '@/lib/product-image-resolver';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// In-memory LRU-like cache for dynamic watermarked images (max 100 entries)
const watermarkMemoryCache = new Map<string, { buffer: Buffer; contentType: string; timestamp: number }>();
const MAX_CACHE_SIZE = 100;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawSrc = searchParams.get('src') || searchParams.get('url');

    if (!rawSrc) {
      return NextResponse.json(
        { success: false, error: 'Missing image source parameter (?src=...)' },
        { status: 400 }
      );
    }

    const src = decodeURIComponent(rawSrc).trim();

    // Check memory cache first
    const cached = watermarkMemoryCache.get(src);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return new NextResponse(new Uint8Array(cached.buffer), {
        status: 200,
        headers: {
          'Content-Type': cached.contentType,
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
          'X-Watermark-Cache': 'HIT',
        },
      });
    }

    let imageBuffer: Buffer | null = null;
    let contentType = 'image/jpeg';

    // 1. Google Drive URL or File ID
    const driveId = extractGoogleDriveId(src);
    if (driveId) {
      // Check if already saved on local disk
      const localProductFile = path.join(process.cwd(), 'public', 'assets', 'products', `${driveId}.png`);
      if (fs.existsSync(localProductFile) && fs.statSync(localProductFile).size > 1000) {
        try {
          const diskBuf = fs.readFileSync(localProductFile);
          return new NextResponse(new Uint8Array(diskBuf), {
            status: 200,
            headers: {
              'Content-Type': 'image/png',
              'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
              'X-Watermark-Status': 'FROM_DISK',
            },
          });
        } catch {}
      }

      // Fetch from Google Drive using multi-endpoint resilient fetcher
      const fetched = await fetchGoogleDriveImageBuffer(driveId);
      if (fetched) {
        imageBuffer = fetched.buffer;
        contentType = fetched.contentType;
      }
    }

    // 2. Local public file (e.g. /assets/bolt_zinc.jpg, /assets/products/...)
    if (!imageBuffer && (src.startsWith('/') || !src.includes('://'))) {
      const relativePath = src.startsWith('/') ? src.slice(1) : src;
      const localFilePath = path.join(process.cwd(), 'public', relativePath);

      if (fs.existsSync(localFilePath)) {
        try {
          imageBuffer = fs.readFileSync(localFilePath);
          const ext = path.extname(localFilePath).toLowerCase();
          if (ext === '.png') contentType = 'image/png';
          else if (ext === '.webp') contentType = 'image/webp';
          else contentType = 'image/jpeg';
        } catch (err) {
          console.warn('[api/watermark] Failed reading local file:', err);
        }
      }
    }

    // 3. Remote HTTP/HTTPS URL
    if (!imageBuffer && (src.startsWith('http://') || src.startsWith('https://'))) {
      try {
        const res = await fetch(src, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (res.ok) {
          const arr = await res.arrayBuffer();
          imageBuffer = Buffer.from(arr);
          const ct = res.headers.get('content-type');
          if (ct && ct.startsWith('image/')) contentType = ct;
        }
      } catch (err) {
        console.warn('[api/watermark] Failed fetching remote URL:', err);
      }
    }

    // Fallback: If image couldn't be loaded, load default bolt_zinc.jpg
    if (!imageBuffer) {
      const fallbackPath = path.join(process.cwd(), 'public', 'assets', 'bolt_zinc.jpg');
      if (fs.existsSync(fallbackPath)) {
        imageBuffer = fs.readFileSync(fallbackPath);
        contentType = 'image/jpeg';
      } else {
        return NextResponse.json(
          { success: false, error: 'Could not load target image' },
          { status: 404 }
        );
      }
    }

    // Apply CBH Watermark in Center (Transparent)
    const watermarkedBuffer = await compositeWatermark(imageBuffer, {
      opacity: 0.22,
      position: 'center',
      scale: 0.46,
    });

    // If from Google Drive, cache the watermarked buffer to local disk for permanent fast serving
    if (driveId && watermarkedBuffer && watermarkedBuffer.length > 500) {
      try {
        const prodDir = path.join(process.cwd(), 'public', 'assets', 'products');
        if (!fs.existsSync(prodDir)) fs.mkdirSync(prodDir, { recursive: true });
        const localDriveFile = path.join(prodDir, `${driveId}.png`);
        fs.writeFileSync(localDriveFile, watermarkedBuffer);
      } catch (saveErr) {
        console.warn('[api/watermark] Failed saving Drive image to disk:', saveErr);
      }
    }

    // Save to memory cache (evict oldest if full)
    if (watermarkMemoryCache.size >= MAX_CACHE_SIZE) {
      const firstKey = watermarkMemoryCache.keys().next().value;
      if (firstKey) watermarkMemoryCache.delete(firstKey);
    }
    watermarkMemoryCache.set(src, {
      buffer: watermarkedBuffer,
      contentType,
      timestamp: Date.now(),
    });

    return new NextResponse(new Uint8Array(watermarkedBuffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        'X-Watermark-Status': 'APPLIED',
      },
    });
  } catch (error: any) {
    console.error('[api/watermark] Unhandled error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Watermarking failed' },
      { status: 500 }
    );
  }
}
