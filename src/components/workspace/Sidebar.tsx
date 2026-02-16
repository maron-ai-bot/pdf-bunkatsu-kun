import { FileText, Sparkles, SplitSquareVertical, FolderOpen } from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { ApiKeyInput } from './ApiKeyInput.tsx';
import { ModelSelector } from './ModelSelector.tsx';
import { NamingRuleEditor } from './NamingRuleEditor.tsx';
import type { PdfFileInfo, AiSettings } from '../../types/index.ts';

interface SidebarProps {
  pdfInfo: PdfFileInfo;
  aiSettings: AiSettings;
  onUpdateSettings: (updates: Partial<AiSettings>) => void;
  segmentCount: number;
  isAnalyzing: boolean;
  isSplitting: boolean;
  onAnalyze: () => void;
  onSplit: () => void;
  onReset: () => void;
}

export function Sidebar({
  pdfInfo,
  aiSettings,
  onUpdateSettings,
  segmentCount,
  isAnalyzing,
  isSplitting,
  onAnalyze,
  onSplit,
  onReset,
}: SidebarProps) {
  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col h-screen overflow-y-auto scrollbar-thin">
      {/* PDF Info */}
      <div className="p-4 border-b border-slate-100">
        <h2 className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          <FileText className="w-3.5 h-3.5" />
          PDF情報
        </h2>
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">ファイル名:</span>
            <span className="font-medium text-slate-800 truncate max-w-[140px]" title={pdfInfo.fileName}>
              {pdfInfo.fileName}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">ページ数:</span>
            <span className="font-medium text-slate-800">{pdfInfo.pageCount}ページ</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">ファイルサイズ:</span>
            <span className="font-medium text-slate-800">{pdfInfo.fileSizeLabel}</span>
          </div>
        </div>
      </div>

      {/* AI Settings */}
      <div className="p-4 border-b border-slate-100 space-y-4">
        <h2 className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          AI設定
        </h2>
        <ApiKeyInput
          value={aiSettings.apiKey}
          onChange={(apiKey) => onUpdateSettings({ apiKey })}
        />
        <ModelSelector
          value={aiSettings.model}
          onChange={(model) => onUpdateSettings({ model })}
          apiKey={aiSettings.apiKey}
        />
        <NamingRuleEditor settings={aiSettings} onUpdate={onUpdateSettings} />
      </div>

      {/* Actions */}
      <div className="p-4 space-y-3">
        <Button
          variant="primary"
          className="w-full"
          onClick={onAnalyze}
          isLoading={isAnalyzing}
          disabled={!aiSettings.apiKey || isAnalyzing}
        >
          <Sparkles className="w-4 h-4" />
          AI分析
        </Button>

        <Button
          variant="primary"
          className="w-full"
          onClick={onSplit}
          isLoading={isSplitting}
          disabled={segmentCount === 0 || isSplitting}
        >
          <SplitSquareVertical className="w-4 h-4" />
          分割実行
        </Button>

        {/* Segment Count */}
        <div className="text-sm text-slate-500">
          分割セグメント
          <span className="block text-2xl font-bold text-slate-800">
            {segmentCount}件
          </span>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Reset Button */}
      <div className="p-4 border-t border-slate-100">
        <Button
          variant="secondary"
          className="w-full"
          size="sm"
          onClick={onReset}
        >
          <FolderOpen className="w-4 h-4" />
          新しいPDFを開く
        </Button>
      </div>
    </aside>
  );
}
