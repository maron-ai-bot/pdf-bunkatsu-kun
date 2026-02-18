import { useState } from 'react';
import { Pencil, GripVertical } from 'lucide-react';
import type { Segment, PdfPage } from '../../types/index.ts';

interface SegmentCardProps {
  segment: Segment;
  index: number;
  pages: PdfPage[];
  onNameChange: (id: string, newName: string) => void;
  onPageClick: (pageNumber: number) => void;
  isDragging?: boolean;
}

export function SegmentCard({
  segment,
  index,
  pages,
  onNameChange,
  onPageClick,
  isDragging,
}: SegmentCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(segment.name);
  const pageCount = segment.endPage - segment.startPage + 1;
  const segmentPages = pages.filter(
    (p) => p.pageNumber >= segment.startPage && p.pageNumber <= segment.endPage
  );

  const handleSave = () => {
    onNameChange(segment.id, editName);
    setIsEditing(false);
  };

  return (
    <div
      className={`rounded-xl border-2 p-4 ${segment.color} transition-all ${
        isDragging ? 'shadow-lg ring-2 ring-purple-400' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start gap-2 mb-3">
        {/* ドラッグハンドル */}
        <div className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 mt-0.5 shrink-0">
          <GripVertical className="w-4 h-4" />
        </div>

        <span className="bg-purple-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="w-full text-sm font-semibold bg-white border border-purple-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-400"
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 cursor-pointer group"
              >
                <Pencil className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-sm font-semibold text-slate-800 truncate">
                  {segment.name}
                </span>
              </button>
            </div>
          )}
        </div>
        <span className="text-xs text-slate-500 whitespace-nowrap">
          {segment.startPage}〜{segment.endPage}ページ ({pageCount}p)
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-500 mb-3 ml-12">
        {segment.description}
      </p>

      {/* Page Thumbnails */}
      <div className="flex gap-2 ml-12 overflow-x-auto pb-1">
        {segmentPages.map((page) => (
          <div
            key={page.pageNumber}
            onClick={() => onPageClick(page.pageNumber)}
            className="relative shrink-0 w-20 cursor-pointer rounded-md overflow-hidden border border-slate-200 bg-white hover:border-purple-400 transition-colors"
          >
            <img
              src={page.thumbnailUrl}
              alt={`ページ ${page.pageNumber}`}
              className="w-full h-auto"
              loading="lazy"
            />
            <div className="absolute bottom-0.5 left-0.5 bg-purple-600/80 text-white text-[9px] font-bold w-4 h-4 rounded flex items-center justify-center">
              {page.pageNumber}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
