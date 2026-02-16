import { Merge } from 'lucide-react';
import { SegmentCard } from './SegmentCard.tsx';
import type { Segment, PdfPage } from '../../types/index.ts';

interface SegmentListViewProps {
  segments: Segment[];
  pages: PdfPage[];
  onNameChange: (id: string, newName: string) => void;
  onMergeWithNext: (id: string) => void;
  onPageClick: (pageNumber: number) => void;
}

export function SegmentListView({
  segments,
  pages,
  onNameChange,
  onMergeWithNext,
  onPageClick,
}: SegmentListViewProps) {
  return (
    <div className="space-y-1">
      {segments.map((segment, index) => (
        <div key={segment.id}>
          <SegmentCard
            segment={segment}
            index={index}
            pages={pages}
            onNameChange={onNameChange}
            onPageClick={onPageClick}
          />
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
