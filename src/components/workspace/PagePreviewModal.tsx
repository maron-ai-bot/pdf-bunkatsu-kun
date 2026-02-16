import { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { PdfPage } from '../../types/index.ts';

interface PagePreviewModalProps {
  pages: PdfPage[];
  currentPage: number;
  onClose: () => void;
  onNavigate: (pageNumber: number) => void;
}

export function PagePreviewModal({
  pages,
  currentPage,
  onClose,
  onNavigate,
}: PagePreviewModalProps) {
  const currentPageData = pages.find((p) => p.pageNumber === currentPage);
  const totalPages = pages.length;

  const goToPrev = useCallback(() => {
    if (currentPage > 1) onNavigate(currentPage - 1);
  }, [currentPage, onNavigate]);

  const goToNext = useCallback(() => {
    if (currentPage < totalPages) onNavigate(currentPage + 1);
  }, [currentPage, totalPages, onNavigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, goToPrev, goToNext]);

  if (!currentPageData) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors cursor-pointer z-10"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Image */}
      <div
        className="relative max-w-4xl max-h-[85vh] mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentPageData.thumbnailUrl}
          alt={`ページ ${currentPage}`}
          className="max-h-[85vh] w-auto rounded-lg shadow-2xl bg-white"
        />
      </div>

      {/* Navigation */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/90 backdrop-blur rounded-full px-4 py-2 shadow-lg">
        <button
          onClick={(e) => {
            e.stopPropagation();
            goToPrev();
          }}
          disabled={currentPage <= 1}
          className="p-1 text-slate-600 hover:text-purple-600 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-semibold text-slate-700 min-w-[60px] text-center">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            goToNext();
          }}
          disabled={currentPage >= totalPages}
          className="p-1 text-slate-600 hover:text-purple-600 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
