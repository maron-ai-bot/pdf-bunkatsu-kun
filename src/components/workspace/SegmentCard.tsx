import { useState, useRef, useEffect } from 'react';
import { Pencil, GripVertical, Scissors, Trash2, X } from 'lucide-react';
import type { Segment, PdfPage } from '../../types/index.ts';

interface SegmentCardProps {
  segment: Segment;
  index: number;
  pages: PdfPage[];
  allSegments: Segment[];
  onNameChange: (id: string, newName: string) => void;
  onSplit: (id: string, chunkSize: number) => void;
  onDelete: (id: string) => void;
  onRemovePage: (segmentId: string, pageNumber: number) => void;
  onMovePageToSegment: (pageNumber: number, fromSegmentId: string, toSegmentId: string) => void;
  onPageClick: (pageNumber: number) => void;
  isDragging?: boolean;
  isPageDropTarget?: boolean;
}

export function SegmentCard({
  segment,
  index,
  pages,
  onNameChange,
  onSplit,
  onDelete,
  onRemovePage,
  onMovePageToSegment,
  onPageClick,
  isDragging,
  isPageDropTarget,
}: SegmentCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(segment.name);
  const [showSplitMenu, setShowSplitMenu] = useState(false);
  const [chunkSize, setChunkSize] = useState(2);
  const [draggingPage, setDraggingPage] = useState<number | null>(null);
  const splitMenuRef = useRef<HTMLDivElement>(null);

  const pageCount = segment.pages.length;
  const startPage = segment.pages.length > 0 ? Math.min(...segment.pages) : 0;
  const endPage = segment.pages.length > 0 ? Math.max(...segment.pages) : 0;
  const segmentPages = pages.filter((p) => segment.pages.includes(p.pageNumber));

  // メニュー外クリックで閉じる
  useEffect(() => {
    if (!showSplitMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (splitMenuRef.current && !splitMenuRef.current.contains(e.target as Node)) {
        setShowSplitMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSplitMenu]);

  const handleSave = () => {
    onNameChange(segment.id, editName);
    setIsEditing(false);
  };

  const handleSplitIndividual = () => {
    onSplit(segment.id, 1);
    setShowSplitMenu(false);
  };

  const handleSplitChunks = () => {
    if (chunkSize >= 1 && chunkSize < pageCount) {
      onSplit(segment.id, chunkSize);
      setShowSplitMenu(false);
    }
  };

  // ページD&D: ドラッグ開始
  const handlePageDragStart = (e: React.DragEvent, pageNumber: number) => {
    e.stopPropagation(); // セグメントD&Dを阻止
    e.dataTransfer.setData(
      'application/page-move',
      JSON.stringify({ pageNumber, fromSegmentId: segment.id })
    );
    e.dataTransfer.effectAllowed = 'move';
    setDraggingPage(pageNumber);
  };

  const handlePageDragEnd = () => {
    setDraggingPage(null);
  };

  // ドロップ受け入れ
  const handleCardDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('application/page-move')) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleCardDrop = (e: React.DragEvent) => {
    const data = e.dataTransfer.getData('application/page-move');
    if (!data) return;
    e.preventDefault();
    e.stopPropagation();

    const { pageNumber, fromSegmentId } = JSON.parse(data);
    if (fromSegmentId !== segment.id) {
      onMovePageToSegment(pageNumber, fromSegmentId, segment.id);
    }
  };

  return (
    <div
      onDragOver={handleCardDragOver}
      onDrop={handleCardDrop}
      className={`rounded-xl border-2 p-4 transition-all ${segment.color} ${
        isDragging ? 'shadow-lg ring-2 ring-purple-400' : ''
      } ${isPageDropTarget ? 'ring-2 ring-purple-500 bg-purple-100/50' : ''}`}
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
          {startPage}〜{endPage}ページ ({pageCount}p)
        </span>

        {/* 分割ボタン（2ページ以上のセグメントのみ表示） */}
        {pageCount > 1 && (
          <div className="relative shrink-0" ref={splitMenuRef}>
            <button
              onClick={() => setShowSplitMenu(!showSplitMenu)}
              className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-700 hover:bg-orange-50 px-2 py-1 rounded-lg transition-colors cursor-pointer"
              title="このセグメントを分割"
            >
              <Scissors className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">分割</span>
            </button>

            {/* 分割メニュー */}
            {showSplitMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg p-3 z-20 min-w-[200px]">
                <p className="text-xs font-semibold text-slate-600 mb-2">
                  分割方法を選択
                </p>

                {/* 1ページずつ */}
                <button
                  onClick={handleSplitIndividual}
                  className="w-full text-left text-sm text-slate-700 hover:bg-purple-50 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  1ページずつ分割
                  <span className="text-xs text-slate-400 ml-1">→ {pageCount}個</span>
                </button>

                {/* N枚ごと */}
                <div className="flex items-center gap-2 mt-2 px-3 py-2">
                  <input
                    type="number"
                    min={1}
                    max={pageCount - 1}
                    value={chunkSize}
                    onChange={(e) => setChunkSize(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-14 text-sm text-center bg-white border border-slate-200 rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  <span className="text-sm text-slate-600">枚ごと</span>
                  <button
                    onClick={handleSplitChunks}
                    disabled={chunkSize < 1 || chunkSize >= pageCount}
                    className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    分割
                  </button>
                </div>
                {chunkSize >= 1 && chunkSize < pageCount && (
                  <p className="text-[11px] text-slate-400 px-3 mt-1">
                    → {Math.ceil(pageCount / chunkSize)}個に分割
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* 削除ボタン */}
        <button
          onClick={() => onDelete(segment.id)}
          className="shrink-0 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors cursor-pointer"
          title="このセグメントを削除"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
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
            draggable={pageCount > 1}
            onDragStart={(e) => handlePageDragStart(e, page.pageNumber)}
            onDragEnd={handlePageDragEnd}
            onClick={() => onPageClick(page.pageNumber)}
            className={`group/thumb relative shrink-0 w-20 cursor-pointer rounded-md overflow-hidden border border-slate-200 bg-white hover:border-purple-400 transition-all ${
              pageCount > 1 ? 'cursor-grab active:cursor-grabbing' : ''
            } ${draggingPage === page.pageNumber ? 'opacity-40 ring-2 ring-purple-400' : ''}`}
          >
            <img
              src={page.thumbnailUrl}
              alt={`ページ ${page.pageNumber}`}
              className="w-full h-auto pointer-events-none"
              loading="lazy"
            />
            {/* ページ削除×ボタン */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemovePage(segment.id, page.pageNumber);
              }}
              className="absolute top-0.5 right-0.5 bg-red-500/80 hover:bg-red-600 text-white w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity cursor-pointer"
              title={`ページ${page.pageNumber}を削除`}
            >
              <X className="w-2.5 h-2.5" />
            </button>
            <div className="absolute bottom-0.5 left-0.5 bg-purple-600/80 text-white text-[9px] font-bold w-4 h-4 rounded flex items-center justify-center">
              {page.pageNumber}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
