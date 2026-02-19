import * as pdfjsLib from 'pdfjs-dist';
import type { PdfPage } from '../types/index.ts';

if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

export async function renderAllPages(
  file: File,
  onProgress?: (current: number, total: number) => void
): Promise<PdfPage[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
    cMapPacked: true,
  }).promise;
  const pages: PdfPage[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    if (onProgress) onProgress(i, pdf.numPages);

    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    if (ctx) {
      await page.render({ canvasContext: ctx, viewport }).promise;

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png')
      );

      if (blob) {
        pages.push({
          pageNumber: i,
          thumbnailUrl: URL.createObjectURL(blob),
          thumbnailBlob: blob,
        });
      }
    }
  }

  return pages;
}

export function cleanupPages(pages: PdfPage[]): void {
  pages.forEach((p) => URL.revokeObjectURL(p.thumbnailUrl));
}

/**
 * 参照書類（PDF/画像）をBlob配列に変換する。
 * PDFの場合は各ページを画像化、画像ファイルはそのまま返す。
 */
export async function fileToImageBlobs(file: File): Promise<Blob[]> {
  if (file.type === 'application/pdf') {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({
      data: arrayBuffer,
      cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
      cMapPacked: true,
    }).promise;
    const blobs: Blob[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      if (ctx) {
        await page.render({ canvasContext: ctx, viewport }).promise;
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, 'image/png')
        );
        if (blob) blobs.push(blob);
      }
    }
    return blobs;
  }
  // 画像ファイル（PNG/JPG等）はそのまま返す
  return [file];
}
