import JSZip from 'jszip';
// FIX: Import types from the types.ts module.
import { Preset, ProcessingProgress } from '../types';

/**
 * Resizes an image file using the browser's native canvas functionality.
 * This method is highly compatible and avoids issues with browser fingerprinting protection.
 * @param file The image file to resize.
 * @param longestSide The maximum length of the longest side of the image.
 * @param outputFormat The target image format.
 * @param quality The quality setting for JPEG/WEBP (1-100).
 * @returns A Promise that resolves with the resized image as a Blob and its MIME type.
 */
async function resizeImage(
    file: File,
    longestSide: number,
    outputFormat: 'original' | 'jpeg' | 'png' | 'webp',
    quality: number,
): Promise<{blob: Blob, mimeType: string}> {
  const imageBitmap = await createImageBitmap(file);

  const { width: originalWidth, height: originalHeight } = imageBitmap;
  const aspectRatio = originalWidth / originalHeight;

  let finalWidth = originalWidth;
  let finalHeight = originalHeight;

  if (originalWidth > longestSide || originalHeight > longestSide) {
      if (aspectRatio > 1) { // Landscape
          finalWidth = longestSide;
          finalHeight = finalWidth / aspectRatio;
      } else { // Portrait or Square
          finalHeight = longestSide;
          finalWidth = finalHeight * aspectRatio;
      }
  }

  const toCanvas = document.createElement('canvas');
  toCanvas.width = Math.round(finalWidth);
  toCanvas.height = Math.round(finalHeight);
  
  const ctx = toCanvas.getContext('2d');
  if (!ctx) {
    imageBitmap.close(); // clean up before throwing
    throw new Error('Failed to get 2D context for resize.');
  }
  // Use browser's native drawImage for resizing.
  // This ensures functionality across all browsers, regardless of fingerprinting protection.
  ctx.drawImage(imageBitmap, 0, 0, toCanvas.width, toCanvas.height);

  // Release memory
  imageBitmap.close();

  const supportedOriginalTypes = ['image/png', 'image/jpeg', 'image/webp'];
  let mimeType = `image/${outputFormat}`;

  if (outputFormat === 'original') {
      mimeType = supportedOriginalTypes.includes(file.type) ? file.type : 'image/jpeg';
  }

  // Quality for canvas.toBlob is 0 to 1 for JPEG/WEBP
  const qualityValue = (outputFormat === 'jpeg' || outputFormat === 'webp') ? quality / 100 : undefined;

  return new Promise((resolve, reject) => {
    toCanvas.toBlob(
      (blob) => {
        if (blob) {
          resolve({ blob, mimeType });
        } else {
          reject(new Error('Failed to create blob from canvas.'));
        }
      },
      mimeType,
      qualityValue
    );
  });
}


/**
 * Processes a list of image files based on a selected preset.
 * Each image is resized for each output setting in the preset, and all resulting
 * images are packaged into a single ZIP file.
 * @param files An array of File objects to process.
 * @param preset The preset containing output settings (folder names and dimensions).
 * @param onProgress A callback function to report progress during processing.
 * @param outputFormat The target image format for all processed images.
 * @param quality The compression quality for JPEG/WEBP images (1-100).
 * @returns A Promise that resolves with a Blob of the generated ZIP file.
 */
export const processImages = async (
  files: File[],
  preset: Preset,
  onProgress: (progress: ProcessingProgress) => void,
  outputFormat: 'original' | 'jpeg' | 'png' | 'webp',
  quality: number,
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
        const { blob: resizedBlob, mimeType } = await resizeImage(file, output.longestSide, outputFormat, quality);
        
        const lastDotIndex = file.name.lastIndexOf('.');
        const nameWithoutExt = lastDotIndex !== -1 ? file.name.substring(0, lastDotIndex) : file.name;
        
        // Correctly determine extension from the actual output MIME type to handle all cases.
        const newExtension = mimeType.split('/')[1] || 'bin';
        const fileName = `${nameWithoutExt}.${newExtension}`;
        
        const folder = zip.folder(output.folderName);
        if (folder) {
          folder.file(fileName, resizedBlob, { binary: true });
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