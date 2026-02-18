import { PDFDocument } from 'pdf-lib';
import type { Segment } from '../types/index.ts';

export interface SplitResult {
  fileName: string;
  blob: Blob;
}

export async function splitPdf(
  originalFile: File,
  segments: Segment[]
): Promise<SplitResult[]> {
  const arrayBuffer = await originalFile.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer);
  const results: SplitResult[] = [];

  for (const segment of segments) {
    const newDoc = await PDFDocument.create();
    const pageIndices = segment.pages.map((p) => p - 1); // 1-indexed → 0-indexed

    const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);
    copiedPages.forEach((page) => newDoc.addPage(page));

    const pdfBytes = await newDoc.save();
    const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });

    results.push({
      fileName: `${segment.name}.pdf`,
      blob,
    });
  }

  return results;
}

export function downloadAll(results: SplitResult[]): void {
  results.forEach((result, index) => {
    setTimeout(() => {
      const url = URL.createObjectURL(result.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, index * 200);
  });
}
