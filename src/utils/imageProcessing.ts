/**
 * Image processing utilities:
 * - Canvas-based automatic background cutout (isolates rug geometry from background floors/studios)
 * - Contrast & color auto-enhancement
 * - Crop to bounding box
 */

export interface BackgroundRemovalOptions {
  tolerance?: number; // 0 to 100, sensitivity for background color detection
  targetColor?: { r: number; g: number; b: number }; // if undefined, detected automatically from perimeter corners
  smoothEdges?: boolean;
  cropToContent?: boolean;
  featherRadius?: number;
}

/**
 * Remove background automatically in client canvas:
 * Identifies background hue/luminance from the 4 corner pixels (typical for studio/floor rug shots),
 * applies a flood/color-distance threshold with soft alpha falloff, and crops to the rug bounding box.
 */
export async function removeImageBackgroundInBrowser(
  imageSrc: string,
  options: BackgroundRemovalOptions = {}
): Promise<string> {
  const {
    tolerance = 28,
    cropToContent = true,
    smoothEdges = true
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          return resolve(imageSrc);
        }

        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;
        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        // Sample background colors from four corners & outer borders (top, bottom, left, right edges)
        const samplePoints = [
          [2, 2],
          [width - 3, 2],
          [2, height - 3],
          [width - 3, height - 3],
          [Math.floor(width / 2), 2],
          [Math.floor(width / 2), height - 3],
          [2, Math.floor(height / 2)],
          [width - 3, Math.floor(height / 2)]
        ];

        const bgSamples: Array<[number, number, number]> = [];
        for (const [sx, sy] of samplePoints) {
          const idx = (sy * width + sx) * 4;
          bgSamples.push([data[idx], data[idx + 1], data[idx + 2]]);
        }

        // Calculate average background RGB
        const avgBg = bgSamples.reduce(
          (acc, [r, g, b]) => [acc[0] + r, acc[1] + g, acc[2] + b],
          [0, 0, 0]
        ).map(v => v / bgSamples.length);

        const thresh = (tolerance / 100) * 441.67; // max distance in RGB space sqrt(255^2*3) = 441.67
        const feather = smoothEdges ? 18 : 0;

        let minX = width;
        let minY = height;
        let maxX = 0;
        let maxY = 0;

        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Distance to closest background sample
            let minDist = 999999;
            for (const [br, bg, bb] of bgSamples) {
              const dr = r - br;
              const dg = g - bg;
              const db = b - bb;
              const dist = Math.sqrt(dr * dr + dg * dg + db * db);
              if (dist < minDist) minDist = dist;
            }

            // Also check distance to avgBg
            const dar = r - avgBg[0];
            const dag = g - avgBg[1];
            const dab = b - avgBg[2];
            const avgDist = Math.sqrt(dar * dar + dag * dag + dab * dab);
            const finalDist = Math.min(minDist, avgDist);

            if (finalDist <= thresh) {
              data[i + 3] = 0; // Transparent
            } else if (smoothEdges && finalDist < thresh + feather) {
              // Smooth edge gradient alpha
              const alphaFactor = (finalDist - thresh) / feather;
              data[i + 3] = Math.round(255 * Math.min(1, Math.max(0, alphaFactor)));
              minX = Math.min(minX, x);
              minY = Math.min(minY, y);
              maxX = Math.max(maxX, x);
              maxY = Math.max(maxY, y);
            } else {
              minX = Math.min(minX, x);
              minY = Math.min(minY, y);
              maxX = Math.max(maxX, x);
              maxY = Math.max(maxY, y);
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);

        // Crop to bounding box if detected valid content
        if (cropToContent && minX < maxX && minY < maxY) {
          const padding = 12;
          const cropX = Math.max(0, minX - padding);
          const cropY = Math.max(0, minY - padding);
          const cropW = Math.min(width - cropX, maxX - minX + padding * 2);
          const cropH = Math.min(height - cropY, maxY - minY + padding * 2);

          const croppedCanvas = document.createElement('canvas');
          croppedCanvas.width = cropW;
          croppedCanvas.height = cropH;
          const croppedCtx = croppedCanvas.getContext('2d');
          if (croppedCtx) {
            croppedCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
            return resolve(croppedCanvas.toDataURL('image/png'));
          }
        }

        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        console.warn('Canvas background removal encountered an issue, returning original image:', err);
        resolve(imageSrc);
      }
    };
    img.onerror = () => resolve(imageSrc);
    img.src = imageSrc;
  });
}
