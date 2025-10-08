import type React from 'react';

// FIX: Add global JSX augmentation for the 'ion-icon' custom element.
// This ensures TypeScript recognizes it as a valid JSX tag throughout the application.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'ion-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { name: string; }, HTMLElement>;
    }
  }
}

export interface OutputSetting {
  id: string;
  folderName: string;
  longestSide: number;
}

export interface Preset {
  id:string;
  name: string;
  isDefault?: boolean;
  outputs: OutputSetting[];
}

export interface ProcessedFile {
  id: string;
  file: File;
  previewUrl: string;
}

export interface ProcessingProgress {
  current: number;
  total: number;
  status: string;
  fileName: string;
}