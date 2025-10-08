import type React from 'react';

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
