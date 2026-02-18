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

      const result = await analyzeDocumentBoundaries(
        pages.map((p) => p.thumbnailBlob),
        aiSettings.apiKey,
        aiSettings.model,
        namingRule
      );

      const newSegments: Segment[] = result.segments.map((s, i) => ({
        id: generateId(),
        name: s.name,
        startPage: s.startPage,
        endPage: s.endPage,
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

  const handleMergeWithNext = useCallback((id: string) => {
    setSegments((prev) => {
      const index = prev.findIndex((s) => s.id === id);
      if (index === -1 || index >= prev.length - 1) return prev;

      const current = prev[index];
      const next = prev[index + 1];
      const merged: Segment = {
        ...current,
        endPage: next.endPage,
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
      onReorderSegments={handleReorderSegments}
      previewPage={previewPage}
      onPreviewPage={setPreviewPage}
    />
  );
}

export default App;
