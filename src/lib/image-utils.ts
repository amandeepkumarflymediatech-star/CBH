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
