import { Sidebar } from './Sidebar.tsx';
import { PageThumbnailGrid } from './PageThumbnailGrid.tsx';
import { SegmentListView } from './SegmentListView.tsx';
import { PagePreviewModal } from './PagePreviewModal.tsx';
import { Scissors, RotateCw } from 'lucide-react';
import type { PdfFileInfo, PdfPage, Segment, AiSettings } from '../../types/index.ts';

interface WorkspaceLayoutProps {
  pdfInfo: PdfFileInfo;
  pages: PdfPage[];
  segments: Segment[];
  aiSettings: AiSettings;
  onUpdateSettings: (updates: Partial<AiSettings>) => void;
  isAnalyzing: boolean;
  isSplitting: boolean;
  onAnalyze: () => void;
  onSplit: () => void;
  onReset: () => void;
  onSegmentNameChange: (id: string, newName: string) => void;
  onMergeWithNext: (id: string) => void;
  onSplitSegment: (id: string, chunkSize: number) => void;
  onReorderSegments: (fromIndex: number, toIndex: number) => void;
  previewPage: number | null;
  onPreviewPage: (pageNumber: number | null) => void;
}

export function WorkspaceLayout({
  pdfInfo,
  pages,
  segments,
  aiSettings,
  onUpdateSettings,
  isAnalyzing,
  isSplitting,
  onAnalyze,
  onSplit,
  onReset,
  onSegmentNameChange,
  onMergeWithNext,
  onSplitSegment,
  onReorderSegments,
  previewPage,
  onPreviewPage,
}: WorkspaceLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      {/* Header (top bar) */}
      <div className="fixed top-0 left-0 right-0 h-12 bg-white border-b border-slate-200 flex items-center px-4 z-30">
        <div className="flex items-center gap-2">
          <Scissors className="w-5 h-5 text-purple-600" />
          <h1 className="text-base font-bold text-slate-800">PDF分割くん</h1>
        </div>
        <span className="ml-auto text-xs text-slate-400">
          {isAnalyzing && (
            <span className="flex items-center gap-1 text-purple-600">
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
              AI分析中...
            </span>
          )}
        </span>
      </div>

      {/* Sidebar */}
      <div className="pt-12">
        <Sidebar
          pdfInfo={pdfInfo}
          aiSettings={aiSettings}
          onUpdateSettings={onUpdateSettings}
          segmentCount={segments.length}
          isAnalyzing={isAnalyzing}
          isSplitting={isSplitting}
          onAnalyze={onAnalyze}
          onSplit={onSplit}
          onReset={onReset}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 pt-12 overflow-auto">
        <div className="p-6">
          {segments.length === 0 ? (
            <PageThumbnailGrid
              pages={pages}
              onPageClick={(n) => onPreviewPage(n)}
            />
          ) : (
            <SegmentListView
              segments={segments}
              pages={pages}
              onNameChange={onSegmentNameChange}
              onMergeWithNext={onMergeWithNext}
              onSplit={onSplitSegment}
              onReorder={onReorderSegments}
              onPageClick={(n) => onPreviewPage(n)}
            />
          )}
        </div>
      </main>

      {/* Preview Modal */}
      {previewPage !== null && (
        <PagePreviewModal
          pages={pages}
          currentPage={previewPage}
          onClose={() => onPreviewPage(null)}
          onNavigate={(n) => onPreviewPage(n)}
        />
      )}
    </div>
  );
}
