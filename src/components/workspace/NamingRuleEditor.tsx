import { useState, useRef, useCallback } from 'react';
import { Tag, ChevronDown, ChevronUp, Upload, FileText, X, Loader2 } from 'lucide-react';
import { fileToImageBlobs } from '../../lib/pdf-renderer.ts';
import type { AiSettings } from '../../types/index.ts';

interface NamingRuleEditorProps {
  settings: AiSettings;
  onUpdate: (updates: Partial<AiSettings>) => void;
}

export function NamingRuleEditor({ settings, onUpdate }: NamingRuleEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReferenceFile = useCallback(
    async (file: File) => {
      setIsProcessing(true);
      try {
        const blobs = await fileToImageBlobs(file);
        onUpdate({
          referenceImages: blobs,
          referenceFileName: file.name,
        });
      } catch (err) {
        console.error('参照書類の読み込みに失敗:', err);
        alert('参照書類の読み込みに失敗しました');
      } finally {
        setIsProcessing(false);
      }
    },
    [onUpdate]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleReferenceFile(file);
      e.target.value = '';
    },
    [handleReferenceFile]
  );

  const handleClearReference = useCallback(() => {
    onUpdate({ referenceImages: [], referenceFileName: '' });
  }, [onUpdate]);

  const modeLabel =
    settings.namingRule === 'reference'
      ? '参照書類'
      : settings.namingRule === 'custom'
        ? 'カスタム'
        : '自動';

  const modeBadgeColor =
    settings.namingRule === 'auto'
      ? 'bg-slate-100 text-slate-500'
      : 'bg-purple-100 text-purple-700';

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-xs font-semibold text-slate-500 cursor-pointer"
      >
        <span className="flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5" />
          命名ルール
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${modeBadgeColor}`}
          >
            {modeLabel}
          </span>
        </span>
        {isOpen ? (
          <ChevronUp className="w-3.5 h-3.5" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" />
        )}
      </button>

      {isOpen && (
        <div className="mt-2 space-y-2">
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => onUpdate({ namingRule: 'auto' })}
              className={`text-xs px-3 py-1 rounded-lg cursor-pointer ${
                settings.namingRule === 'auto'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              自動
            </button>
            <button
              onClick={() => onUpdate({ namingRule: 'custom' })}
              className={`text-xs px-3 py-1 rounded-lg cursor-pointer ${
                settings.namingRule === 'custom'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              カスタム
            </button>
            <button
              onClick={() => onUpdate({ namingRule: 'reference' })}
              className={`text-xs px-3 py-1 rounded-lg cursor-pointer ${
                settings.namingRule === 'reference'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              参照書類
            </button>
          </div>

          {/* カスタムモード: テキスト入力 */}
          {settings.namingRule === 'custom' && (
            <textarea
              value={settings.customNamingPrompt}
              onChange={(e) => onUpdate({ customNamingPrompt: e.target.value })}
              placeholder="例: YYYYMMDD_書類名の形式で命名してください"
              rows={3}
              className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
            />
          )}

          {/* 参照書類モード: ファイルアップロード */}
          {settings.namingRule === 'reference' && (
            <div className="space-y-2">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                月次資料確認書などの番号表をアップロードすると、番号に基づいて命名します
              </p>

              {settings.referenceFileName ? (
                /* アップロード済み表示 */
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <FileText className="w-4 h-4 text-green-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-green-800 truncate">
                      {settings.referenceFileName}
                    </p>
                    <p className="text-[10px] text-green-600">
                      {settings.referenceImages.length}ページ読み込み済み
                    </p>
                  </div>
                  <button
                    onClick={handleClearReference}
                    className="shrink-0 text-green-400 hover:text-red-500 transition-colors cursor-pointer"
                    title="参照書類を削除"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                /* アップロードボタン */
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-300 rounded-lg text-xs text-slate-500 hover:border-purple-400 hover:text-purple-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      読み込み中...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      PDF・画像をアップロード
                    </>
                  )}
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf,image/*"
                className="hidden"
                onChange={handleFileInputChange}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
