import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export interface WatermarkOptions {
  watermarkPath?: string;
  opacity?: number; // default: 0.22 (22% semi-transparent)
  position?: 'center' | 'bottom-right'; // default: 'center'
  scale?: number; // width percentage of base image, default: 0.45
}

/**
 * Composites the CBH Fasteners brand watermark logo onto an image buffer.
 * By default: SEMI-TRANSPARENT (opacity: 0.22) and positioned directly in the CENTER.
 */
export async function compositeWatermark(
  imageBuffer: Buffer,
  options?: string | WatermarkOptions
): Promise<Buffer> {
  try {
    const opts: WatermarkOptions =
      typeof options === 'string'
        ? { watermarkPath: options }
        : options || {};

    const defaultWmPath = path.join(process.cwd(), 'public', 'assets', 'cbh-watermark.png');
    const targetWm = opts.watermarkPath || defaultWmPath;
    const opacity = typeof opts.opacity === 'number' ? Math.max(0.05, Math.min(1, opts.opacity)) : 0.22;
    const position = opts.position || 'center';
    const scaleFactor = typeof opts.scale === 'number' ? opts.scale : (position === 'center' ? 0.46 : 0.28);

    if (!fs.existsSync(targetWm)) {
      console.warn('[compositeWatermark] Watermark asset not found at:', targetWm);
      return imageBuffer;
    }

    const baseMeta = await sharp(imageBuffer).metadata();
    if (!baseMeta.width || !baseMeta.height) {
      return imageBuffer;
    }

    // Proportional sizing: for center watermark, ~46% of base width (min 120px, max 540px)
    const targetWmWidth = Math.min(
      Math.round(baseMeta.width * scaleFactor),
      Math.max(120, Math.min(540, Math.round(baseMeta.width * 0.50)))
    );

    const resizedWmBuffer = await sharp(targetWm)
      .resize({ width: targetWmWidth })
      .ensureAlpha()
      .toBuffer();

    // Multiply alpha channel to produce genuine transparency
    const { data, info } = await sharp(resizedWmBuffer)
      .raw()
      .toBuffer({ resolveWithObject: true });

    for (let i = 3; i < data.length; i += 4) {
      data[i] = Math.round(data[i] * opacity);
    }

    const transparentWmBuffer = await sharp(data, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4,
      },
    })
      .png()
      .toBuffer();

    // Calculate position: CENTER or BOTTOM-RIGHT
    let left: number;
    let top: number;

    if (position === 'center') {
      left = Math.max(0, Math.round((baseMeta.width - info.width) / 2));
      top = Math.max(0, Math.round((baseMeta.height - info.height) / 2));
    } else {
      const padding = Math.min(30, Math.max(10, Math.round(baseMeta.width * 0.025)));
      left = Math.max(0, baseMeta.width - info.width - padding);
      top = Math.max(0, baseMeta.height - info.height - padding);
    }

    // Composite transparent watermark
    const composited = await sharp(imageBuffer)
      .composite([
        {
          input: transparentWmBuffer,
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
