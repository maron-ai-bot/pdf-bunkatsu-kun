import { useState, useCallback } from 'react';
import { UploadScreen } from './components/upload/UploadScreen.tsx';
import { WorkspaceLayout } from './components/workspace/WorkspaceLayout.tsx';
import { renderAllPages, cleanupPages } from './lib/pdf-renderer.ts';
import { analyzeDocumentBoundaries } from './lib/gemini.ts';
import { splitPdf, downloadAll } from './lib/pdf-splitter.ts';
import { formatFileSize, generateId, SEGMENT_COLORS } from './lib/utils.ts';
import type { AppView, PdfFileInfo, PdfPage, Segment, AiSettings } from './types/index.ts';

function App() {
  const [view, setView] = useState<AppView>('upload');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfInfo, setPdfInfo] = useState<PdfFileInfo | null>(null);
  const [pages, setPages] = useState<PdfPage[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSplitting, setIsSplitting] = useState(false);
  const [previewPage, setPreviewPage] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [aiSettings, setAiSettings] = useState<AiSettings>(() => ({
    apiKey: localStorage.getItem('GEMINI_API_KEY') || '',
    model: localStorage.getItem('GEMINI_MODEL') || 'gemini-2.0-flash',
    namingRule: 'auto',
    customNamingPrompt: '',
    referenceImages: [],
    referenceFileName: '',
  }));

  const handleUpdateSettings = useCallback((updates: Partial<AiSettings>) => {
    setAiSettings((prev) => {
      const next = { ...prev, ...updates };
      if (updates.apiKey !== undefined) {
        localStorage.setItem('GEMINI_API_KEY', updates.apiKey);
      }
      if (updates.model !== undefined) {
        localStorage.setItem('GEMINI_MODEL', updates.model);
      }
      return next;
    });
  }, []);

  const handleFileSelected = useCallback(async (file: File) => {
    setIsLoading(true);
    try {
      const renderedPages = await renderAllPages(file);

      setPdfFile(file);
      setPdfInfo({
        file,
        fileName: file.name,
        pageCount: renderedPages.length,
        fileSize: file.size,
        fileSizeLabel: formatFileSize(file.size),
      });
      setPages(renderedPages);
      setSegments([]);
      setView('workspace');
    } catch (err) {
      console.error('PDF読み込みエラー:', err);
      alert('PDFの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!aiSettings.apiKey) {
      alert('APIキーを入力してください');
      return;
    }
    if (pages.length === 0) return;

    setIsAnalyzing(true);
    try {
      const namingRule =
        aiSettings.namingRule === 'custom' ? aiSettings.customNamingPrompt : '';
      const referenceImages =
        aiSettings.namingRule === 'reference' ? aiSettings.referenceImages : undefined;

      const result = await analyzeDocumentBoundaries(
        pages.map((p) => p.thumbnailBlob),
        aiSettings.apiKey,
        aiSettings.model,
        namingRule,
        referenceImages
      );

      const newSegments: Segment[] = result.segments.map((s, i) => ({
        id: generateId(),
        name: s.name,
        pages: Array.from({ length: s.endPage - s.startPage + 1 }, (_, j) => s.startPage + j),
        description: s.description,
        color: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
      }));

      setSegments(newSegments);
    } catch (err) {
      console.error('AI分析エラー:', err);
      alert(`AI分析に失敗しました: ${err instanceof Error ? err.message : '不明なエラー'}`);
    } finally {
      setIsAnalyzing(false);
    }
  }, [aiSettings, pages]);

  const handleSplit = useCallback(async () => {
    if (!pdfFile || segments.length === 0) return;

    setIsSplitting(true);
    try {
      const results = await splitPdf(pdfFile, segments);
      downloadAll(results);
    } catch (err) {
      console.error('分割エラー:', err);
      alert('PDF分割に失敗しました');
    } finally {
      setIsSplitting(false);
    }
  }, [pdfFile, segments]);

  const handleSegmentNameChange = useCallback((id: string, newName: string) => {
    setSegments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name: newName } : s))
    );
  }, []);

  const handleReorderSegments = useCallback((fromIndex: number, toIndex: number) => {
    setSegments((prev) => {
      const newSegments = [...prev];
      const [removed] = newSegments.splice(fromIndex, 1);
      newSegments.splice(toIndex, 0, removed);
      return newSegments;
    });
  }, []);

  const handleSplitSegment = useCallback((id: string, chunkSize: number) => {
    setSegments((prev) => {
      const index = prev.findIndex((s) => s.id === id);
      if (index === -1) return prev;

      const segment = prev[index];
      if (segment.pages.length <= 1) return prev;

      const newSegments: Segment[] = [];
      let counter = 1;
      for (let i = 0; i < segment.pages.length; i += chunkSize) {
        const chunk = segment.pages.slice(i, i + chunkSize);
        newSegments.push({
          id: generateId(),
          name: `${segment.name}_${counter}`,
          pages: chunk,
          description: segment.description,
          color: SEGMENT_COLORS[(index + counter - 1) % SEGMENT_COLORS.length],
        });
        counter++;
      }

      return [...prev.slice(0, index), ...newSegments, ...prev.slice(index + 1)];
    });
  }, []);

  const handleRecolorSegments = useCallback(() => {
    setSegments((prev) =>
      prev.map((s, i) => ({ ...s, color: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }))
    );
  }, []);

  const handleDeleteSegment = useCallback((id: string) => {
    setSegments((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const handleRemovePage = useCallback((segmentId: string, pageNumber: number) => {
    setSegments((prev) => {
      const segment = prev.find((s) => s.id === segmentId);
      if (!segment) return prev;
      // 1ページしかない場合はセグメントごと削除
      if (segment.pages.length <= 1) {
        return prev.filter((s) => s.id !== segmentId);
      }
      // ページを除外
      return prev.map((s) =>
        s.id === segmentId ? { ...s, pages: s.pages.filter((p) => p !== pageNumber) } : s
      );
    });
  }, []);

  const handleMovePageToSegment = useCallback(
    (pageNumber: number, fromSegmentId: string, toSegmentId: string) => {
      setSegments((prev) => {
        const fromIdx = prev.findIndex((s) => s.id === fromSegmentId);
        const toIdx = prev.findIndex((s) => s.id === toSegmentId);
        if (fromIdx === -1 || toIdx === -1) return prev;

        const from = prev[fromIdx];
        if (from.pages.length <= 1) return prev; // 1ページしかないなら移動不可

        return prev.map((s) => {
          if (s.id === fromSegmentId) {
            // 移動元: そのページだけ除外
            return { ...s, pages: s.pages.filter((p) => p !== pageNumber) };
          }
          if (s.id === toSegmentId) {
            // 移動先: ページを追加してソート
            return { ...s, pages: [...s.pages, pageNumber].sort((a, b) => a - b) };
          }
          return s;
        });
      });
    },
    []
  );

  const handleMergeWithNext = useCallback((id: string) => {
    setSegments((prev) => {
      const index = prev.findIndex((s) => s.id === id);
      if (index === -1 || index >= prev.length - 1) return prev;

      const current = prev[index];
      const next = prev[index + 1];
      const merged: Segment = {
        ...current,
        pages: [...current.pages, ...next.pages].sort((a, b) => a - b),
        description: `${current.description} + ${next.description}`,
      };

      return [...prev.slice(0, index), merged, ...prev.slice(index + 2)];
    });
  }, []);

  const handleReset = useCallback(() => {
    cleanupPages(pages);
    setPdfFile(null);
    setPdfInfo(null);
    setPages([]);
    setSegments([]);
    setPreviewPage(null);
    setView('upload');
  }, [pages]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="animate-spin w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full" />
        <p className="mt-4 text-sm text-slate-500">PDFを読み込んでいます...</p>
      </div>
    );
  }

  if (view === 'upload') {
    return <UploadScreen onFileSelected={handleFileSelected} />;
  }

  if (!pdfInfo) return null;

  return (
    <WorkspaceLayout
      pdfInfo={pdfInfo}
      pages={pages}
      segments={segments}
      aiSettings={aiSettings}
      onUpdateSettings={handleUpdateSettings}
      isAnalyzing={isAnalyzing}
      isSplitting={isSplitting}
      onAnalyze={handleAnalyze}
      onSplit={handleSplit}
      onReset={handleReset}
      onSegmentNameChange={handleSegmentNameChange}
      onMergeWithNext={handleMergeWithNext}
      onSplitSegment={handleSplitSegment}
      onReorderSegments={handleReorderSegments}
      onRecolorSegments={handleRecolorSegments}
      onDeleteSegment={handleDeleteSegment}
      onRemovePage={handleRemovePage}
      onMovePageToSegment={handleMovePageToSegment}
      previewPage={previewPage}
      onPreviewPage={setPreviewPage}
    />
  );
}

export default App;
