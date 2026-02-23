import { useState, useRef, useCallback } from 'react';
import { Upload, Scissors, FileUp, Sparkles, Download, Key, ChevronDown, ChevronUp, MessageCircle, FileText } from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { CONTACT_FORM_URL } from '../../lib/utils.ts';
import { TermsModal } from '../auth/TermsModal.tsx';

interface UploadScreenProps {
  onFileSelected: (file: File) => void;
}

export function UploadScreen({ onFileSelected }: UploadScreenProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (file.type === 'application/pdf') {
        onFileSelected(file);
      } else {
        alert('PDFファイルのみ対応しています');
      }
    },
    [onFileSelected]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const [showGuide, setShowGuide] = useState(true);
  const [showTerms, setShowTerms] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center bg-background p-4 pt-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <Scissors className="w-8 h-8 text-purple-600" />
        <h1 className="text-3xl font-bold text-slate-800">PDF分割くん</h1>
      </div>

      <p className="text-sm text-slate-500 mb-6 text-center">
        複数の書類がまとまった1つのPDFを、AIが自動で書類ごとに分割します
      </p>

      {/* 使い方ガイド */}
      <div className="w-full max-w-2xl mb-6">
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors"
        >
          {showGuide ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          使い方ガイド
        </button>

        {showGuide && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 mt-1 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Step 1 */}
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <FileUp className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    Step 1：PDFをアップロード
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    請求書や領収書など、複数の書類が1つにまとまったPDFを選択
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Key className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    Step 2：APIキーを入力
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    <a
                      href="https://aistudio.google.com/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700 underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Google AI Studio
                    </a>
                    で無料取得したGemini APIキーを入力
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    Step 3：AI分析を実行
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    AIが書類の区切りを自動判定し、ファイル名もつけてくれます
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Download className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    Step 4：分割してダウンロード
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    結果を確認して「分割実行」で個別PDFをダウンロード
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          w-full max-w-2xl rounded-2xl border-2 border-dashed p-10
          flex flex-col items-center justify-center gap-5
          transition-all cursor-pointer
          ${
            isDragging
              ? 'border-purple-500 bg-purple-50 scale-[1.02]'
              : 'border-slate-300 bg-white hover:border-purple-400 hover:bg-slate-50'
          }
        `}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center">
          <Upload className="w-7 h-7 text-purple-600" />
        </div>

        <div className="text-center">
          <p className="text-lg font-semibold text-slate-700">
            PDFファイルをここにドラッグ&ドロップ
          </p>
          <p className="text-sm text-slate-500 mt-1">
            または下のボタンをクリックしてファイルを選択
          </p>
        </div>

        <Button
          variant="primary"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
        >
          <Upload className="w-4 h-4" />
          ファイルを選択
        </Button>

        <p className="text-xs text-slate-400">対応形式: PDF (.pdf)</p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={handleInputChange}
        />
      </div>

      {/* Footer: お問い合わせ & 利用規約 */}
      <div className="mt-8 mb-4 text-center flex items-center justify-center gap-4">
        <a
          href={CONTACT_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-purple-600 transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          ご意見・お問い合わせ
        </a>
        <span className="text-slate-300">|</span>
        <button
          onClick={() => setShowTerms(true)}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-purple-600 transition-colors cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5" />
          利用規約
        </button>
      </div>

      {/* 利用規約モーダル */}
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
    </div>
  );
}
