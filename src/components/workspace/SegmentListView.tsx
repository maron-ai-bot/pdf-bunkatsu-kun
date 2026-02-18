import { useState, useCallback } from 'react';
import { Merge } from 'lucide-react';
import { SegmentCard } from './SegmentCard.tsx';
import type { Segment, PdfPage } from '../../types/index.ts';

interface SegmentListViewProps {
  segments: Segment[];
  pages: PdfPage[];
  onNameChange: (id: string, newName: string) => void;
  onMergeWithNext: (id: string) => void;
  onSplit: (id: string, chunkSize: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onDelete: (id: string) => void;
  onMovePageToSegment: (pageNumber: number, fromSegmentId: string, toSegmentId: string) => void;
  onPageClick: (pageNumber: number) => void;
}

export function SegmentListView({
  segments,
  pages,
  onNameChange,
  onMergeWithNext,
  onSplit,
  onReorder,
  onDelete,
  onMovePageToSegment,
  onPageClick,
}: SegmentListViewProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((index: number) => {
    setDragIndex(index);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (dragIndex !== null && index !== dragIndex) {
        setDropIndex(index);
      }
    },
    [dragIndex]
  );

  const handleDragLeave = useCallback(() => {
    setDropIndex(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, toIndex: number) => {
      e.preventDefault();
      if (dragIndex !== null && dragIndex !== toIndex) {
        onReorder(dragIndex, toIndex);
      }
      setDragIndex(null);
      setDropIndex(null);
    },
    [dragIndex, onReorder]
  );

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setDropIndex(null);
  }, []);

  return (
    <div className="space-y-1">
      {segments.map((segment, index) => (
        <div key={segment.id}>
          {/* ドロップインジケーター（上側） */}
          {dropIndex === index && dragIndex !== null && dragIndex > index && (
            <div className="h-1 bg-purple-500 rounded-full mx-4 mb-1 animate-pulse" />
          )}

          <div
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`transition-opacity ${
              dragIndex === index ? 'opacity-40' : ''
            }`}
          >
            <SegmentCard
              segment={segment}
              index={index}
              pages={pages}
              allSegments={segments}
              onNameChange={onNameChange}
              onSplit={onSplit}
              onDelete={onDelete}
              onMovePageToSegment={onMovePageToSegment}
              onPageClick={onPageClick}
              isDragging={dragIndex === index}
            />
          </div>

          {/* ドロップインジケーター（下側） */}
          {dropIndex === index && dragIndex !== null && dragIndex < index && (
            <div className="h-1 bg-purple-500 rounded-full mx-4 mt-1 animate-pulse" />
          )}

          {index < segments.length - 1 && (
            <div className="flex justify-center py-1">
              <button
                onClick={() => onMergeWithNext(segment.id)}
                className="flex items-center gap-1 text-xs text-purple-500 hover:text-purple-700 hover:bg-purple-50 px-3 py-1 rounded-full transition-colors cursor-pointer"
              >
                <Merge className="w-3 h-3" />
                次と結合
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
