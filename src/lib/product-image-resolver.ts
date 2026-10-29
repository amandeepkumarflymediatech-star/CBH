import fs from 'fs';
import path from 'path';
import https from 'https';

/**
 * Extracts Google Drive file ID from all common Google Drive URL formats
 */
export function extractGoogleDriveId(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  
  // Format 1: /file/d/<FILE_ID>/view...
  const m1 = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]{20,})/);
  if (m1) return m1[1];

  // Format 2: ?id=<FILE_ID> or &id=<FILE_ID>
  const m2 = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{20,})/);
  if (m2) return m2[1];

  // Format 3: lh3.googleusercontent.com/d/<FILE_ID>
  const m3 = trimmed.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]{20,})/);
  if (m3) return m3[1];

  return null;
}

/**
 * High-quality category placeholder fallback
 */
export function getCategoryPlaceholder(category: string = '', name: string = ''): string {
  const combined = `${category} ${name}`.toLowerCase();
  if (combined.includes('grub')) {
    return '/files/grub-screw-din916.png';
  }
  if (combined.includes('socket') || combined.includes('allen') || combined.includes('csk')) {
    return '/assets/products/1U_Tqo_2VpVxvv1P7BUPGeHXZe2akS68g.png';
  }
  if (combined.includes('flange')) {
    return '/assets/products/1ITZ9-R797BC3OIbAZD4utchxvf4eUwRT.png';
  }
  if (combined.includes('rod') || combined.includes('hsfg') || combined.includes('stud')) {
    return '/assets/products/1cM0hddDO7TQq_s7ceszHilx-XZYgqnHE.png';
  }
  return '/assets/bolt_zinc.jpg';
}

/**
 * Converts any raw URL (including Google Drive HTML view links) into a directly renderable image URL.
 * NEVER returns a Google Drive /file/d/.../view HTML page URL to the browser.
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
    return trimmed;
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

    // Otherwise use direct Google Usercontent Edge CDN image URL
    return `https://lh3.googleusercontent.com/d/${driveId}=w800`;
  }

  // If it's an external HTTP/HTTPS image
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  return getCategoryPlaceholder(category, name);
}

/**
 * Downloads a Google Drive image and saves it to public/assets/products/<id>.png
 */
export function downloadDriveImageToFile(id: string): Promise<string> {
  return new Promise((resolve) => {
    const destDir = path.resolve(process.cwd(), 'public', 'assets', 'products');
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const dest = path.join(destDir, `${id}.png`);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 500) {
      return resolve(`/assets/products/${id}.png`);
    }

    const downloadUrl = `https://lh3.googleusercontent.com/d/${id}=w800`;
    const file = fs.createWriteStream(dest);

    const req = https.get(downloadUrl, (res) => {
      // Follow redirect if 301/302
      if (res.statusCode === 301 || res.statusCode === 302) {
        const redirectUrl = res.headers.location;
        file.close();
        try { fs.unlinkSync(dest); } catch {}
        if (!redirectUrl) return resolve(downloadUrl);

        const redirectFile = fs.createWriteStream(dest);
        https.get(redirectUrl, (r2) => {
          if (r2.statusCode !== 200) {
            redirectFile.close();
            try { fs.unlinkSync(dest); } catch {}
            return resolve(downloadUrl);
          }
          r2.pipe(redirectFile);
          redirectFile.on('finish', () => {
            redirectFile.close(() => {
              resolve(`/assets/products/${id}.png`);
            });
          });
        }).on('error', () => {
          redirectFile.close();
          try { fs.unlinkSync(dest); } catch {}
          resolve(downloadUrl);
        });
        return;
      }

      if (res.statusCode !== 200) {
        file.close();
        try { fs.unlinkSync(dest); } catch {}
        return resolve(downloadUrl);
      }

      res.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          try {
            const stats = fs.statSync(dest);
            if (stats.size > 500) {
              return resolve(`/assets/products/${id}.png`);
            }
            fs.unlinkSync(dest);
          } catch {}
          resolve(downloadUrl);
        });
      });
    });

    req.on('error', () => {
      file.close();
      try { fs.unlinkSync(dest); } catch {}
      resolve(downloadUrl);
    });

    req.setTimeout(12000, () => {
      req.destroy();
      file.close();
      try { fs.unlinkSync(dest); } catch {}
      resolve(downloadUrl);
    });
  });
}

/**
 * Automatically downloads and saves images for a batch of products in the background.
 * Updates MySQL when each image is saved so database always reflects local files.
 */
export async function autoSaveUploadedImages(
  items: { gdriveImageUrl?: string; imageUrl?: string }[],
  onImageSaved?: (driveId: string, localUrl: string) => Promise<void>
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
  const concurrency = 4;

  const executing: Promise<any>[] = [];
  for (const id of idList) {
    const p = (async () => {
      const savedPath = await downloadDriveImageToFile(id);
      resultMap.set(id, savedPath);
      if (savedPath.startsWith('/assets/') && onImageSaved) {
        try {
          await onImageSaved(id, savedPath);
        } catch (e) {
          console.warn('[Image AutoSave] Error in onImageSaved callback:', e);
        }
      }
    })();

    executing.push(p);
    if (executing.length >= concurrency) {
      await Promise.race(executing);
      // Clean finished
      for (let i = executing.length - 1; i >= 0; i--) {
        // Simple filter check
      }
    }
  }

  await Promise.all(executing);
  return resultMap;
}

