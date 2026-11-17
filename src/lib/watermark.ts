import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

/**
 * Composites the CBH Fasteners brand watermark logo onto the right-bottom side of an image buffer.
 */
export async function compositeWatermark(
  imageBuffer: Buffer,
  watermarkPath?: string
): Promise<Buffer> {
  try {
    const defaultWmPath = path.join(process.cwd(), 'public', 'assets', 'cbh-watermark.png');
    const targetWm = watermarkPath || defaultWmPath;

    if (!fs.existsSync(targetWm)) {
      console.warn('[compositeWatermark] Watermark asset not found at:', targetWm);
      return imageBuffer;
    }

    const baseMeta = await sharp(imageBuffer).metadata();
    if (!baseMeta.width || !baseMeta.height) {
      return imageBuffer;
    }

    // Proportional sizing: 24% to 30% of base image width, clamped between 80px and 360px
    const targetWmWidth = Math.min(
      Math.round(baseMeta.width * 0.28),
      Math.max(80, Math.min(360, Math.round(baseMeta.width * 0.32)))
    );

    const resizedWmBuffer = await sharp(targetWm)
      .resize({ width: targetWmWidth })
      .toBuffer();

    const wmMeta = await sharp(resizedWmBuffer).metadata();
    if (!wmMeta.width || !wmMeta.height) {
      return imageBuffer;
    }

    // Clean padding from right and bottom edges (approx 2.5% of width, min 10px, max 30px)
    const padding = Math.min(30, Math.max(10, Math.round(baseMeta.width * 0.025)));
    const left = Math.max(0, baseMeta.width - wmMeta.width - padding);
    const top = Math.max(0, baseMeta.height - wmMeta.height - padding);

    // Composite watermark onto right-bottom corner
    const composited = await sharp(imageBuffer)
      .composite([
        {
          input: resizedWmBuffer,
          top,
          left,
        },
      ])
      .toBuffer();

    return composited;
  } catch (error) {
    console.error('[compositeWatermark] Error applying watermark:', error);
    return imageBuffer;
  }
}
