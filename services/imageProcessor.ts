// FIX: Implemented image processing logic to resolve module errors and provide functionality.
// This module was previously a placeholder, causing build failures.
import JSZip from 'jszip';
import { Preset, ProcessingProgress } from '../types';

/**
 * Resizes an image file to ensure its longest side does not exceed a specified length.
 * @param file The image file to resize.
 * @param longestSide The maximum length of the longest side of the image.
 * @returns A Promise that resolves with the resized image as a Blob.
 */
async function resizeImage(file: File, longestSide: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(img.src); // Clean up memory as soon as it's loaded into the Image object
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return reject(new Error('Could not get 2D rendering context for canvas.'));
      }

      let { width, height } = img;
      const aspectRatio = width / height;

      if (width > longestSide || height > longestSide) {
          if (aspectRatio > 1) { // Landscape
              width = longestSide;
              height = width / aspectRatio;
          } else { // Portrait or Square
              height = longestSide;
              width = height * aspectRatio;
          }
      }
      
      canvas.width = Math.round(width);
      canvas.height = Math.round(height);
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const mimeType = ['image/png', 'image/jpeg', 'image/webp'].includes(file.type) ? file.type : 'image/jpeg';
      const quality = mimeType === 'image/jpeg' ? 0.92 : undefined; // Quality setting only applies to jpeg/webp

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas toBlob operation failed to produce a blob.'));
          }
        },
        mimeType,
        quality
      );
    };
    img.onerror = (error) => {
      URL.revokeObjectURL(img.src);
      reject(new Error(`Failed to load image: ${error}`));
    };
  });
}

/**
 * Processes a list of image files based on a selected preset.
 * Each image is resized for each output setting in the preset, and all resulting
 * images are packaged into a single ZIP file.
 * @param files An array of File objects to process.
 * @param preset The preset containing output settings (folder names and dimensions).
 * @param onProgress A callback function to report progress during processing.
 * @returns A Promise that resolves with a Blob of the generated ZIP file.
 */
export const processImages = async (
  files: File[],
  preset: Preset,
  onProgress: (progress: ProcessingProgress) => void
): Promise<Blob> => {
  const zip = new JSZip();
  const totalSteps = files.length * preset.outputs.length;
  let currentStep = 0;

  for (const file of files) {
    for (const output of preset.outputs) {
      currentStep++;
      const progressUpdate: ProcessingProgress = {
        current: currentStep,
        total: totalSteps,
        status: `Processing ${output.folderName}`,
        fileName: file.name,
      };
      onProgress(progressUpdate);

      try {
        const resizedBlob = await resizeImage(file, output.longestSide);
        // JSZip's folder method creates folders if they don't exist.
        const folder = zip.folder(output.folderName);
        if (folder) {
          folder.file(file.name, resizedBlob, { binary: true });
        }
      } catch (error) {
        console.error(`Failed to process ${file.name} for output "${output.folderName}":`, error);
        // Update progress to indicate an error for this step, but continue with others.
        onProgress({
            ...progressUpdate,
            status: `Error on ${output.folderName}`,
        });
      }
    }
  }

  onProgress({
    current: totalSteps,
    total: totalSteps,
    status: 'Compressing files into a ZIP archive...',
    fileName: '',
  });

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  return zipBlob;
};
