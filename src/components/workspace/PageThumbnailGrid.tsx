import type { PdfPage } from '../../types/index.ts';

interface PageThumbnailGridProps {
  pages: PdfPage[];
  onPageClick: (pageNumber: number) => void;
}

export function PageThumbnailGrid({ pages, onPageClick }: PageThumbnailGridProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full">
          1
        </span>
        <h2 className="text-sm font-semibold text-slate-600">ダミーまとめ</h2>
        <span className="text-xs text-slate-400 ml-auto">
          1〜{pages.length}ページ ({pages.length}p)
        </span>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3">
        {pages.map((page) => (
          <div
            key={page.pageNumber}
            onClick={() => onPageClick(page.pageNumber)}
            className="relative group cursor-pointer rounded-lg overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-purple-300 transition-all"
          >
            <img
              src={page.thumbnailUrl}
              alt={`ページ ${page.pageNumber}`}
              className="w-full h-auto"
              loading="lazy"
            />
            <div className="absolute bottom-1 left-1 bg-purple-600 text-white text-[10px] font-bold w-5 h-5 rounded flex items-center justify-center">
              {page.pageNumber}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
