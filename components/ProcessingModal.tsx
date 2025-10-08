import React from 'react';
// FIX: Import types from the types.ts module.
import { ProcessingProgress } from '../types';

interface ProcessingModalProps {
  progress: ProcessingProgress;
}

const ProcessingModal: React.FC<ProcessingModalProps> = ({ progress }) => {
  const percentage = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-md m-4 border border-gray-700">
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">Processing Images...</h2>
        <p className="text-gray-400 mb-2 truncate">
          {progress.status}: <span className="font-medium text-gray-300">{progress.fileName}</span>
        </p>
        <div className="w-full bg-gray-700 rounded-full h-4 mb-2 overflow-hidden">
          <div
            className="bg-cyan-500 h-4 rounded-full transition-all duration-300 ease-linear"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm font-medium text-gray-300">
            <span>{percentage}%</span>
            <span>Step {progress.current} of {progress.total}</span>
        </div>
      </div>
    </div>
  );
};

export default ProcessingModal;
