/**
 * Image processing utilities for Question attachments
 * Handles client-side compression, scaling, and conversion to base64 Data URLs
 * to ensure questions with images persist reliably in LocalStorage and JSON exports.
 */

export async function processImageUpload(
  file: File,
  maxDimension: number = 800,
  quality: number = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If SVG, preserve vector quality directly as data URL
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Gagal membaca file SVG'));
        }
      };
      reader.onerror = () => reject(new Error('Gagal membaca file SVG'));
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          let { width, height } = img;

          // Scale proportionally if either dimension exceeds maxDimension
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            // Fallback to original data URL if 2D context fails
            resolve(e.target?.result as string);
            return;
          }

          // Optional subtle smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Export as compressed JPEG for optimal localStorage footprint
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch {
          // Fallback if canvas drawing fails
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => reject(new Error('Format gambar tidak didukung atau file rusak'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
    reader.readAsDataURL(file);
  });
}

export function isValidImageSource(src?: string): boolean {
  if (!src) return false;
  const trimmed = src.trim();
  return (
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/')
  );
}
