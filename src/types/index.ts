export interface PdfFileInfo {
  file: File;
  fileName: string;
  pageCount: number;
  fileSize: number;
  fileSizeLabel: string;
}

export interface PdfPage {
  pageNumber: number;
  thumbnailUrl: string;
  thumbnailBlob: Blob;
}

export interface Segment {
  id: string;
  name: string;
  pages: number[];
  description: string;
  color: string;
}

export interface AiAnalysisResult {
  segments: Array<{
    name: string;
    startPage: number;
    endPage: number;
    description: string;
  }>;
}

export type AppView = 'upload' | 'workspace';

export interface AiSettings {
  apiKey: string;
  model: string;
  namingRule: 'auto' | 'custom' | 'reference';
  customNamingPrompt: string;
  referenceImages: Blob[];
  referenceFileName: string;
}

export interface GeminiModel {
  id: string;
  displayName: string;
}

export type AnalysisStep = 'convert' | 'send' | 'parse' | 'done';

export interface AnalysisLogEntry {
  timestamp: string;
  page: number | null;
  message: string;
  type: 'info' | 'success' | 'error' | 'step';
}

export interface AnalysisProgress {
  currentPage: number;
  totalPages: number;
  step: AnalysisStep;
  percent: number;
  logs: AnalysisLogEntry[];
}
