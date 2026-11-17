/**
 * Utility to compress and resize images client-side before persisting
 * to avoid exceeding browser localStorage 5MB quota or relying on blob: URLs.
 */
export function compressImageToDataUrl(
  file: File,
  maxDimension = 280,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const isImg =
      (file.type && file.type.startsWith('image/')) ||
      /\.(jpe?g|png|webp|gif|bmp|svg|avif)$/i.test(file.name);

    if (!isImg) {
      return reject(new Error('Selected file is not an image format'));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) return reject(new Error('Could not read image file'));

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width || 280;
          let height = img.height || 280;

          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = Math.max(Math.round(width), 1);
          canvas.height = Math.max(Math.round(height), 1);

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            // Fallback to source if canvas 2d context unavailable
            resolve(src.length > 500000 ? src.slice(0, 500000) : src);
            return;
          }

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          // High-grade compact JPEG (< 25 KB)
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch (canvasErr) {
          console.warn('Canvas compression fallback to raw DataURL:', canvasErr);
          resolve(src);
        }
      };

      img.onerror = () => {
        // Fallback to data URL directly if image object fails to decode
        resolve(src);
      };

      img.src = src;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Applies the CBH watermark on the right-bottom corner of an image client-side.
 * Returns processed Blob, DataURL, and File for instant preview and upload.
 */
export function applyWatermarkClientSide(
  fileOrUrl: File | string,
  watermarkUrl: string = '/assets/cbh-watermark.png'
): Promise<{ blob: Blob; dataUrl: string; file: File }> {
  return new Promise(async (resolve, reject) => {
    try {
      let baseSrc = '';
      let fileName = 'watermarked-fastener.jpg';

      if (typeof fileOrUrl === 'string') {
        baseSrc = fileOrUrl;
      } else {
        fileName = fileOrUrl.name || 'watermarked-fastener.jpg';
        baseSrc = await new Promise<string>((res, rej) => {
          const reader = new FileReader();
          reader.onload = (e) => res(e.target?.result as string);
          reader.onerror = rej;
          reader.readAsDataURL(fileOrUrl);
        });
      }

      const baseImg = new Image();
      baseImg.crossOrigin = 'anonymous';

      baseImg.onload = () => {
        const wmImg = new Image();
        wmImg.crossOrigin = 'anonymous';

        wmImg.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = baseImg.width || 800;
            canvas.height = baseImg.height || 800;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              return reject(new Error('Canvas 2D context not available'));
            }

            // Draw base image
            ctx.drawImage(baseImg, 0, 0);

            // Watermark size: ~28% of base width, clamped between 80px and 360px
            const wmWidth = Math.min(
              Math.round(canvas.width * 0.28),
              Math.max(80, Math.min(360, Math.round(canvas.width * 0.32)))
            );
            const wmHeight = Math.round((wmWidth * wmImg.height) / wmImg.width);
            const padding = Math.min(30, Math.max(10, Math.round(canvas.width * 0.025)));
            const x = Math.max(0, canvas.width - wmWidth - padding);
            const y = Math.max(0, canvas.height - wmHeight - padding);

            // Draw watermark on right-bottom side
            ctx.drawImage(wmImg, x, y, wmWidth, wmHeight);

            canvas.toBlob((blob) => {
              if (!blob) return reject(new Error('Canvas blob export failed'));
              const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
              const file = new File([blob], fileName, { type: 'image/jpeg' });
              resolve({ blob, dataUrl, file });
            }, 'image/jpeg', 0.92);
          } catch (err) {
            reject(err);
          }
        };

        wmImg.onerror = () => {
          // If watermark image fails to load, fallback gracefully
          fetch(baseSrc)
            .then((r) => r.blob())
            .then((blob) => {
              const file = new File([blob], fileName, { type: 'image/jpeg' });
              resolve({ blob, dataUrl: baseSrc, file });
            })
            .catch(reject);
        };

        wmImg.src = watermarkUrl;
      };

      baseImg.onerror = reject;
      baseImg.src = baseSrc;
    } catch (err) {
      reject(err);
    }
  });
}
