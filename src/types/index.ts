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
  namingRule: 'auto' | 'custom';
  customNamingPrompt: string;
}

export interface GeminiModel {
  id: string;
  displayName: string;
}
