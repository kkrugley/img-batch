import React, { useState, useCallback } from 'react';
// FIX: Import types from the types.ts module.
import { Preset, ProcessedFile, ProcessingProgress } from './types';
import ImageUploader from './components/ImageUploader';
import ImageList from './components/ImageList';
import PresetManager from './components/PresetManager';
import ProcessingModal from './components/ProcessingModal';
import AboutModal from './components/AboutModal';
import { processImages } from './services/imageProcessor';
import { Header, Footer } from './components/Layout';
// FIX: Import `Images` icon component to replace `ion-icon`.
import { Download, Images } from './components/Icons';

const App: React.FC = () => {
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('default-1');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<ProcessingProgress>({ current: 0, total: 0, status: '', fileName: '' });
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [showAboutModal, setShowAboutModal] = useState<boolean>(false); // State for About modal
  const [outputFormat, setOutputFormat] = useState<'original' | 'jpeg' | 'png' | 'webp'>('original');
  const [jpegQuality, setJpegQuality] = useState<number>(92);


  const handleFilesSelected = (selectedFiles: File[]) => {
    const newProcessedFiles = selectedFiles
      .filter(file => file.type.startsWith('image/'))
      .map(file => ({
        id: `${file.name}-${file.lastModified}`,
        file,
        previewUrl: URL.createObjectURL(file),
      }));
    setFiles(prevFiles => [...prevFiles, ...newProcessedFiles]);
    setDownloadUrl(null);
  };

  const handleRemoveFile = (id: string) => {
    setFiles(prevFiles => prevFiles.filter(file => file.id !== id));
  };

  const handleClearFiles = () => {
    files.forEach(f => URL.revokeObjectURL(f.previewUrl));
    setFiles([]);
    setDownloadUrl(null);
  };

  const handleProcess = useCallback(async (presets: Preset[]) => {
    const selectedPreset = presets.find(p => p.id === selectedPresetId);
    if (!selectedPreset || files.length === 0) {
      alert("Please select files and a preset first.");
      return;
    }

    setIsProcessing(true);
    setDownloadUrl(null);
    const totalSteps = files.length * selectedPreset.outputs.length;
    setProgress({ current: 0, total: totalSteps, status: 'Starting...', fileName: '' });

    try {
      const zipBlob = await processImages(
        files.map(f => f.file),
        selectedPreset,
        (p: ProcessingProgress) => setProgress(p),
        outputFormat,
        jpegQuality,
      );
      const url = URL.createObjectURL(zipBlob);
      setDownloadUrl(url);
    } catch (error) {
      console.error("Processing failed:", error);
      alert("An error occurred during image processing. Check the console for details.");
    } finally {
      setIsProcessing(false);
    }
  }, [files, selectedPresetId, outputFormat, jpegQuality]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col font-sans">
      <Header onAboutClick={() => setShowAboutModal(true)} />
      <main className="flex-grow container mx-auto p-4 md:p-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-cyan-400 border-b-2 border-cyan-500/20 pb-2">1. Upload Images</h2>
            <ImageUploader onFilesSelected={handleFilesSelected} />
            <ImageList files={files} onRemove={handleRemoveFile} onClear={handleClearFiles} />
          </div>
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-purple-400 border-b-2 border-purple-500/20 pb-2">2. Configure & Process</h2>
            <PresetManager 
              selectedPresetId={selectedPresetId} 
              onPresetChange={setSelectedPresetId} 
              onProcess={handleProcess}
              outputFormat={outputFormat}
              onOutputFormatChange={setOutputFormat}
              jpegQuality={jpegQuality}
              onJpegQualityChange={setJpegQuality}
            />
            
            {downloadUrl && (
                <div className="bg-gray-800 border border-green-500/30 rounded-lg p-6 flex flex-col items-center text-center shadow-lg animate-fade-in">
                    <h3 className="text-xl font-semibold text-green-400 mb-2">Processing Complete!</h3>
                    <p className="text-gray-400 mb-6">Your ZIP archive is ready for download.</p>
                    <a
                        href={downloadUrl}
                        download={`processed_images_${new Date().toISOString().split('T')[0]}.zip`}
                        className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-500 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500"
                    >
                        <Download />
                        Download Archive
                    </a>
                </div>
            )}
             {!downloadUrl && files.length > 0 && (
                <div className="bg-gray-800 border border-cyan-500/30 rounded-lg p-6 flex flex-col items-center text-center shadow-lg">
                    {/* FIX: Replaced ion-icon with a local SVG component to resolve TypeScript errors and align with the project's icon system. Size is controlled via Tailwind classes. */}
                    <Images className="text-cyan-400 mb-4 w-12 h-12" />
                    <h3 className="text-xl font-semibold text-cyan-300 mb-2">Ready to Go!</h3>
                    <p className="text-gray-400">Click the "Process Images" button in the preset manager to start.</p>
                </div>
             )}
          </div>
        </div>
      </main>
      <Footer />
      {isProcessing && <ProcessingModal progress={progress} />}
      {showAboutModal && <AboutModal onClose={() => setShowAboutModal(false)} />}
    </div>
  );
};

export default App;