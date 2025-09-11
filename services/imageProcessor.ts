import { Preset, ProcessingProgress } from '../types';

// Inform TypeScript about global variables from CDNs
declare var pica: any;
declare var JSZip: any;

const picaInstance = pica();

const resizeImage = async (file: File, longestSide: number): Promise<Blob> => {
  const imageBitmap = await createImageBitmap(file);

  const originalWidth = imageBitmap.width;
  const originalHeight = imageBitmap.height;

  // Don't upscale if the longest side is already smaller than or equal to the target.
  if (Math.max(originalWidth, originalHeight) <= longestSide) {
    imageBitmap.close(); // Free up memory
    // If no resize is needed, return the original file blob to avoid re-encoding.
    if (file.type === 'image/jpeg' || file.type === 'image/png') {
        return file.slice();
    }
  }

  const ratio = originalWidth > originalHeight
    ? longestSide / originalWidth
    : longestSide / originalHeight;

  const finalWidth = Math.round(originalWidth * ratio);
  const finalHeight = Math.round(originalHeight * ratio);

  // If dimensions are invalid, return original file
  if (finalWidth <= 0 || finalHeight <= 0) {
    imageBitmap.close(); // Free up memory
    return file.slice();
  }

  const offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = finalWidth;
  offscreenCanvas.height = finalHeight;
  
  try {
    // Primary Method: High-quality resize with Pica.
    await picaInstance.resize(imageBitmap, offscreenCanvas, {
      alpha: true, // Preserve transparency
    });
  } catch (error) {
    // Fallback Method: If Pica fails (due to fingerprinting protection),
    // use the browser's native, more compatible drawImage for resizing.
    console.warn(`Pica failed for ${file.name}, falling back to basic resize. Error:`, error);
    const ctx = offscreenCanvas.getContext('2d');
    if (!ctx) {
      imageBitmap.close();
      throw new Error('Failed to get 2D context for fallback resize.');
    }
    // Quality may be slightly lower than Lanczos, but it ensures functionality.
    ctx.drawImage(imageBitmap, 0, 0, finalWidth, finalHeight);
  } finally {
    // Free up memory in both success and failure cases.
    imageBitmap.close();
  }

  const mimeType = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png';
  const quality = file.type === 'image/jpeg' ? 0.9 : undefined;

  return new Promise<Blob>((resolve, reject) => {
    offscreenCanvas.toBlob(
        (blob) => {
            if (blob) {
                resolve(blob);
            } else {
                reject(new Error('Canvas to Blob conversion failed'));
            }
        },
        mimeType,
        quality
    );
  });
};

export const processImages = async (
  files: File[],
  preset: Preset,
  onProgress: (progress: ProcessingProgress) => void
): Promise<Blob> => {
  const zip = new JSZip();
  const folders: { [key: string]: any } = {};
  
  preset.outputs.forEach(output => {
    if (!folders[output.folderName]) {
      folders[output.folderName] = zip.folder(output.folderName);
    }
  });
  
  const totalSteps = files.length * preset.outputs.length;
  let currentStep = 0;

  for (const file of files) {
    for (const output of preset.outputs) {
      currentStep++;
      onProgress({
        current: currentStep,
        total: totalSteps,
        status: `Resizing for "${output.folderName}"`,
        fileName: file.name
      });
      try {
        const resizedBlob = await resizeImage(file, output.longestSide);
        const safeFileName = file.name.replace(/[\\/]/g, '_');
        folders[output.folderName].file(safeFileName, resizedBlob);
      } catch (error) {
        console.error(`Failed to process ${file.name} for preset ${output.folderName}:`, error);
      }
    }
  }

  onProgress({
    current: totalSteps,
    total: totalSteps,
    status: 'Zipping files',
    fileName: 'archive.zip'
  });

  return zip.generateAsync({ type: 'blob', compression: "DEFLATE", compressionOptions: { level: 6 } });
};
