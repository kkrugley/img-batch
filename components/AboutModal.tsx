import React from 'react';
import { X } from './Icons';

interface AboutModalProps {
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
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
          <p>
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