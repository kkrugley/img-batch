import React, { useState } from 'react';
import { X, ChevronDown } from './Icons';

interface AboutModalProps {
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

  return (
    <div
      className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-modal-title"
    >
      <div
        className="bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-lg m-4 border border-gray-700 relative"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>
        
        <h2 id="about-modal-title" className="text-2xl font-bold text-cyan-400 mb-4">
          About Batch Image Processor
        </h2>
        
        <div className="text-gray-300 space-y-4">
          <p>
            This tool allows you to resize and package multiple images at once, right in your browser. Simply upload your images, choose a processing preset, and download a ZIP file containing the results.
          </p>
          <p>
            <span className="font-semibold text-purple-400">Your privacy is protected.</span> All image processing happens on your own computer (client-side). Your files are never uploaded to a server.
          </p>
          
          {/* Accordion for Instructions */}
          <div className="border-t border-gray-700 pt-4">
            <button
              onClick={() => setIsInstructionsOpen(!isInstructionsOpen)}
              className="w-full flex justify-between items-center text-left text-lg font-semibold text-purple-400 hover:text-purple-300 transition-colors py-2"
              aria-expanded={isInstructionsOpen}
            >
              <span>How to Use</span>
              <ChevronDown className={`w-6 h-6 transition-transform duration-300 ${isInstructionsOpen ? 'rotate-180' : ''}`} />
            </button>
            {isInstructionsOpen && (
              <div className="mt-4 pl-4 border-l-2 border-purple-500/30 text-gray-400 space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <h4 className="font-semibold text-cyan-400">1. Upload Images</h4>
                  <p>
                    Drag and drop your files or click the upload area. A queue of your images will appear.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-cyan-400">2. Configure & Process</h4>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li>
                      <strong className="text-gray-300">Preset:</strong> Pick a preset that defines output sizes (e.g., 'Hi-res', 'Web'). You can also create custom presets.
                    </li>
                    <li>
                      <strong className="text-gray-300">Format:</strong> Choose an output format (JPEG, PNG, WEBP) or keep the original.
                    </li>
                     <li>
                      <strong className="text-gray-300">Process:</strong> Adjust quality if needed, then click the "Process Images" button.
                    </li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-cyan-400">3. Download</h4>
                  <p>
                    Once processing finishes, a "Download Archive" button appears. Click it to save a ZIP file with your images sorted into folders.
                  </p>
                </div>
              </div>
            )}
          </div>

          <p className="border-t border-gray-700 pt-4">
            This project is open-source. You can view the code, suggest features, or report issues on{' '}
            <a
              href="https://github.com/kkrugley/img-batch"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 underline"
            >
              GitHub
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;