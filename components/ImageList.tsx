import React from 'react';
import { ProcessedFile } from '../types';
import { Trash2, X } from './Icons';

interface ImageListProps {
  files: ProcessedFile[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const ImageList: React.FC<ImageListProps> = ({ files, onRemove, onClear }) => {
  if (files.length === 0) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center text-gray-500">
        <p>No images uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-700">
        <h3 className="font-semibold text-lg text-gray-300">{files.length} image{files.length > 1 ? 's' : ''} queued</h3>
        <button
          onClick={onClear}
          className="flex items-center gap-2 px-3 py-1 bg-red-600/20 text-red-400 text-sm rounded-md hover:bg-red-600/40 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Clear All
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto pr-2 space-y-3">
        {files.map((file) => (
          <div key={file.id} className="flex items-center gap-4 bg-gray-700/50 p-2 rounded-md animate-fade-in">
            <img src={file.previewUrl} alt={file.file.name} className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
            <div className="flex-grow overflow-hidden">
              <p className="text-sm font-medium text-gray-200 truncate">{file.file.name}</p>
              <p className="text-xs text-gray-400">{formatBytes(file.file.size)}</p>
            </div>
            <button onClick={() => onRemove(file.id)} className="p-2 rounded-full text-gray-400 hover:bg-gray-600 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageList;
