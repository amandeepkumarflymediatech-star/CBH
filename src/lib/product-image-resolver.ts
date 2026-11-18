import fs from 'fs';
import path from 'path';

/**
 * Extracts Google Drive file ID from all common Google Drive URL formats,
 * including /file/d/<ID>/view, open?id=<ID>, uc?id=<ID>, thumbnail?id=<ID>, and raw IDs.
 */
export function extractGoogleDriveId(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // Format 1: /file/d/<FILE_ID> (e.g. https://drive.google.com/file/d/16k1G5yKicr5ULuxmcyA5FnBmayB1P9X0/view)
  const m1 = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]{20,})/);
  if (m1) return m1[1];

  // Format 2: ?id=<FILE_ID> or &id=<FILE_ID> (e.g. drive.google.com/open?id=..., uc?id=...)
  const m2 = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{20,})/);
  if (m2) return m2[1];

  // Format 3: googleusercontent.com/d/<FILE_ID> or drive.google.com/thumbnail?id=<FILE_ID>
  const m3 = trimmed.match(/(?:googleusercontent\.com\/d\/|drive\.google\.com\/.*[?&]id=)([a-zA-Z0-9_-]{20,})/);
  if (m3) return m3[1];

  // Format 4: Raw 25-45 character alphanumeric Drive ID directly (no protocol/domain)
  if (/^[a-zA-Z0-9_-]{25,45}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * High-quality category placeholder fallback
 */
export function getCategoryPlaceholder(category: string = '', name: string = ''): string {
  const combined = `${category} ${name}`.toLowerCase();
  if (combined.includes('grub')) {
    return '/assets/images/grub-screw-real.png';
  }
  if (combined.includes('socket') || combined.includes('allen') || combined.includes('csk')) {
    return 'https://lh3.googleusercontent.com/d/1U_Tqo_2VpVxvv1P7BUPGeHXZe2akS68g=w400';
  }
  if (combined.includes('flange')) {
    return 'https://lh3.googleusercontent.com/d/1ITZ9-R797BC3OIbAZD4utchxvf4eUwRT=w400';
  }
  if (combined.includes('rod') || combined.includes('hsfg') || combined.includes('stud')) {
    return 'https://lh3.googleusercontent.com/d/1cM0hddDO7TQq_s7ceszHilx-XZYgqnHE=w400';
  }
  if (combined.includes('anchor')) {
    return '/assets/anchor_bolt.jpg';
  }
  return '/assets/bolt_zinc.jpg';
}

// In-memory cache for Google Drive IDs that failed to avoid continuous network thrashing
const failedDriveIdsCache = new Map<string, number>();

/**
 * Resiliently fetches an image buffer from Google Drive using multiple fallback endpoints.
 * Validates actual image magic bytes (PNG, JPEG, WebP, GIF) to ensure error pages are never saved.
 */
export async function fetchGoogleDriveImageBuffer(
  driveId: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const cleanId = driveId.trim();
  if (!cleanId) return null;

  // If known to be inaccessible in the last 5 minutes, avoid hammering network
  const failedAt = failedDriveIdsCache.get(cleanId);
  if (failedAt && Date.now() - failedAt < 300000) {
    return null;
  }

  const endpoints = [
    `https://lh3.googleusercontent.com/d/${cleanId}=w1600`,
    `https://lh3.googleusercontent.com/d/${cleanId}`,
    `https://drive.google.com/thumbnail?id=${cleanId}&sz=w1600`,
    `https://drive.google.com/uc?export=download&id=${cleanId}`,
    `https://docs.google.com/uc?export=download&id=${cleanId}`,
  ];

  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        },
        redirect: 'follow',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const ct = res.headers.get('content-type') || '';
        const arrayBuf = await res.arrayBuffer();
        const buf = Buffer.from(arrayBuf);

        // Verify buffer is actually an image and not an HTML error or permission page
        const isImageContentType = ct.startsWith('image/');
        const hasImageMagicBytes =
          (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) || // PNG
          (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) || // JPEG
          (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46) || // WebP (RIFF)
          (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46); // GIF

        if (buf.length > 500 && (isImageContentType || hasImageMagicBytes)) {
          let determinedType = isImageContentType ? ct : 'image/jpeg';
          if (hasImageMagicBytes) {
            if (buf[0] === 0x89) determinedType = 'image/png';
            else if (buf[0] === 0xFF) determinedType = 'image/jpeg';
            else if (buf[0] === 0x52) determinedType = 'image/webp';
          }
          // Remove from failed cache if previously failed
          failedDriveIdsCache.delete(cleanId);
          return { buffer: buf, contentType: determinedType };
        }
      }
    } catch {
      // Continue to next endpoint fallback
    }
  }

  failedDriveIdsCache.set(cleanId, Date.now());
  return null;
}

/**
 * Converts any raw URL (including Google Drive links) into a directly renderable image URL.
 * Automatically ensures Google Drive links route through the transparent center watermark pipeline.
 */
export function resolveProductImageUrl(
  url?: string | null,
  category: string = '',
  name: string = ''
): string {
  if (!url || url.trim() === '') {
    return getCategoryPlaceholder(category, name);
  }

  const trimmed = url.trim();

  // If it's already a local asset
  if (trimmed.startsWith('/assets/') || trimmed.startsWith('/files/')) {
    try {
      const localFile = path.resolve(process.cwd(), 'public', trimmed.replace(/^\//, ''));
      if (fs.existsSync(localFile) && fs.statSync(localFile).size > 100) {
        return trimmed;
      }
    } catch {}

    const driveMatch = trimmed.match(/\/assets\/products\/([a-zA-Z0-9_-]{20,})\.[a-zA-Z0-9]+/);
    if (driveMatch) {
      return `https://lh3.googleusercontent.com/d/${driveMatch[1]}=w400`;
    }

    return getCategoryPlaceholder(category, name);
  }

  // Extract Drive ID if it's from Google Drive
  const driveId = extractGoogleDriveId(trimmed);
  if (driveId) {
    // If the local file already exists on server disk
    try {
      const localFile = path.resolve(process.cwd(), 'public', 'assets', 'products', `${driveId}.png`);
      if (fs.existsSync(localFile) && fs.statSync(localFile).size > 500) {
        return `/assets/products/${driveId}.png`;
      }
    } catch {}

    return `https://lh3.googleusercontent.com/d/${driveId}=w400`;
  }

  // If it's an external HTTP/HTTPS image
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  return getCategoryPlaceholder(category, name);
}

/**
 * Returns a dynamically watermarked URL for any product photo (local or remote).
 * If the image is not already stamped, routes through the /api/watermark server endpoint.
 */
export function getWatermarkedProductImageUrl(
  url?: string | null,
  category: string = '',
  name: string = ''
): string {
  const resolved = resolveProductImageUrl(url, category, name);
  if (!resolved) return '/assets/bolt_zinc.jpg';

  // Already watermarked locally or dynamically
  if (resolved.includes('fastener-') || resolved.startsWith('/api/watermark')) {
    return resolved;
  }
  // bolt_zinc and anchor_bolt are stamped directly on disk
  if (resolved === '/assets/bolt_zinc.jpg' || resolved === '/assets/anchor_bolt.jpg') {
    return resolved;
  }

  // Dynamic remote or external images route through watermark service
  return `/api/watermark?src=${encodeURIComponent(resolved)}`;
}

/**
 * Downloads a Google Drive image, applies the transparent center watermark,
 * and saves it to public/assets/products/<id>.png.
 */
export async function downloadDriveImageToFile(
  id: string,
  applyWatermark: boolean = true
): Promise<string> {
  const destDir = path.resolve(process.cwd(), 'public', 'assets', 'products');
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const dest = path.join(destDir, `${id}.png`);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
    return `/assets/products/${id}.png`;
  }

  const fetched = await fetchGoogleDriveImageBuffer(id);
  if (!fetched) {
    return '/assets/bolt_zinc.jpg';
  }

  let finalBuffer = fetched.buffer;

  if (applyWatermark) {
    try {
      const { compositeWatermark } = await import('./watermark');
      finalBuffer = await compositeWatermark(finalBuffer, {
        opacity: 0.22,
        position: 'center',
        scale: 0.46,
      });
    } catch (wmErr) {
      console.warn('[downloadDriveImageToFile] Watermark composite warning:', wmErr);
    }
  }

  try {
    fs.writeFileSync(dest, finalBuffer);
    return `/assets/products/${id}.png`;
  } catch (writeErr) {
    console.error('[downloadDriveImageToFile] Failed saving file to disk:', writeErr);
    return `/api/watermark?src=${encodeURIComponent(`https://lh3.googleusercontent.com/d/${id}`)}`;
  }
}

/**
 * Automatically downloads and saves images for a batch of products in the background.
 * Applies transparent center watermark and updates MySQL and memory cache.
 */
export async function autoSaveUploadedImages(
  items: { gdriveImageUrl?: string; imageUrl?: string }[],
  onImageSaved?: (driveId: string, localUrl: string) => Promise<void>,
  applyWatermark: boolean = true
): Promise<Map<string, string>> {
  const resultMap = new Map<string, string>();
  const uniqueIds = new Set<string>();

  for (const item of items) {
    const id1 = extractGoogleDriveId(item.gdriveImageUrl);
    if (id1) uniqueIds.add(id1);
    const id2 = extractGoogleDriveId(item.imageUrl);
    if (id2) uniqueIds.add(id2);
  }

  if (uniqueIds.size === 0) return resultMap;

  const idList = Array.from(uniqueIds);
  const concurrency = 2;

  // Process in strict small chunks to avoid overwhelming the server, network, and MySQL connection pool
  for (let i = 0; i < idList.length; i += concurrency) {
    const chunk = idList.slice(i, i + concurrency);
    await Promise.all(
      chunk.map(async (id) => {
        try {
          const savedPath = await downloadDriveImageToFile(id, applyWatermark);
          resultMap.set(id, savedPath);
          if (savedPath.startsWith('/assets/') && onImageSaved) {
            try {
              await onImageSaved(id, savedPath);
            } catch (e) {
              console.warn('[Image AutoSave] Error in onImageSaved callback:', e);
            }
          }
        } catch (err) {
          console.warn(`[Image AutoSave] Error processing image ${id}:`, err);
        }
      })
    );
  }

  return resultMap;
}
