import React from 'react';
import { Layers, Info } from './Icons';

interface HeaderProps {
  onAboutClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onAboutClick }) => (
  <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 shadow-lg sticky top-0 z-10">
    <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Layers className="w-8 h-8 text-cyan-400" />
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wider">
          Batch Image Processor
        </h1>
      </div>
      <button
        onClick={onAboutClick}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        aria-label="About this application"
      >
        <Info className="w-6 h-6" />
      </button>
    </div>
  </header>
);

export const Footer: React.FC = () => (
  <footer className="bg-gray-900/80 border-t border-gray-700/50 mt-8">
    <div className="container mx-auto px-4 md:px-8 py-4 text-center text-gray-500">
      <p>&copy; {new Date().getFullYear()} Batch Image Processor. All rights reserved.</p>
    </div>
  </footer>
);