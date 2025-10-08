// FIX: Import React to make its types available for JSX augmentation.
import React from 'react';

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

// FIX: Add global type definition for the 'ion-icon' web component.
// Placing this augmentation in a central types file ensures it correctly merges with
// React's default JSX types, resolving errors across the application where
// standard HTML elements were not being recognized by TypeScript.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'ion-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { name: string; }, HTMLElement>;
    }
  }
}
