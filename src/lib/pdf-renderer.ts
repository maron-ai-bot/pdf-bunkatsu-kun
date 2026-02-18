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
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
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
