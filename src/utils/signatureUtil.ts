/**
 * Utility functions for signature image processing
 * Ensures all signature images are standardized to a fixed size
 */

// Standard signature dimensions (aspect ratio 2:1) - for STORAGE
export const SIGNATURE_WIDTH = 600;
export const SIGNATURE_HEIGHT = 300;

// Canvas dimensions for drawing (wider for easier signing)
export const CANVAS_WIDTH = 500;
export const CANVAS_HEIGHT = 200;

/**
 * Resize an image to standard signature dimensions
 * Maintains aspect ratio and centers the image on white background
 */
export const resizeSignatureImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Create canvas with standard dimensions
        const canvas = document.createElement('canvas');
        canvas.width = SIGNATURE_WIDTH;
        canvas.height = SIGNATURE_HEIGHT;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Fill with white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, SIGNATURE_WIDTH, SIGNATURE_HEIGHT);

        // Calculate scaling to fit within canvas while maintaining aspect ratio
        const scale = Math.min(
          SIGNATURE_WIDTH / img.width,
          SIGNATURE_HEIGHT / img.height
        );

        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;

        // Center the image
        const x = (SIGNATURE_WIDTH - scaledWidth) / 2;
        const y = (SIGNATURE_HEIGHT - scaledHeight) / 2;

        // Draw the image
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

        // Convert canvas to blob then to File
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Could not create blob from canvas'));
              return;
            }

            const resizedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, '.png'), // Force PNG extension
              { type: 'image/png' }
            );

            resolve(resizedFile);
          },
          'image/png',
          0.95 // High quality
        );
      };

      img.onerror = () => {
        reject(new Error('Could not load image'));
      };

      if (typeof e.target?.result === 'string') {
        img.src = e.target.result;
      } else {
        reject(new Error('Invalid file data'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Could not read file'));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Resize a canvas data URL to standard signature dimensions
 */
export const resizeSignatureDataURL = (dataURL: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      // Create canvas with standard dimensions
      const canvas = document.createElement('canvas');
      canvas.width = SIGNATURE_WIDTH;
      canvas.height = SIGNATURE_HEIGHT;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Fill with white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, SIGNATURE_WIDTH, SIGNATURE_HEIGHT);

      // Calculate scaling to fit within canvas while maintaining aspect ratio
      const scale = Math.min(
        SIGNATURE_WIDTH / img.width,
        SIGNATURE_HEIGHT / img.height
      );

      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;

      // Center the image
      const x = (SIGNATURE_WIDTH - scaledWidth) / 2;
      const y = (SIGNATURE_HEIGHT - scaledHeight) / 2;

      // Draw the image
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

      // Return as data URL
      resolve(canvas.toDataURL('image/png', 0.95));
    };

    img.onerror = () => {
      reject(new Error('Could not load image from data URL'));
    };

    img.src = dataURL;
  });
};

/**
 * Convert data URL to File with standard dimensions
 */
export const dataURLToStandardFile = async (
  dataURL: string,
  filename: string
): Promise<File> => {
  // First resize to standard dimensions
  const resizedDataURL = await resizeSignatureDataURL(dataURL);

  // Then convert to File
  const arr = resizedDataURL.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch) throw new Error('Invalid dataURL');

  const mime = mimeMatch[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
};
