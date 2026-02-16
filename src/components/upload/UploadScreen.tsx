import { useState, useRef, useCallback } from 'react';
import { Upload, Scissors } from 'lucide-react';
import { Button } from '../ui/Button.tsx';

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-12">
        <Scissors className="w-8 h-8 text-purple-600" />
        <h1 className="text-3xl font-bold text-slate-800">PDF分割くん</h1>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          w-full max-w-2xl rounded-2xl border-2 border-dashed p-16
          flex flex-col items-center justify-center gap-6
          transition-all cursor-pointer
          ${
            isDragging
              ? 'border-purple-500 bg-purple-50 scale-[1.02]'
              : 'border-slate-300 bg-white hover:border-purple-400 hover:bg-slate-50'
          }
        `}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
          <Upload className="w-8 h-8 text-purple-600" />
        </div>

        <div className="text-center">
          <p className="text-lg font-semibold text-slate-700">
            PDFファイルをここにドラッグ&ドロップ
          </p>
          <p className="text-sm text-slate-500 mt-2">
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

        <div className="text-center">
          <p className="text-xs text-slate-400">対応形式: PDF (.pdf)</p>
          <p className="text-xs text-slate-400">
            複数の書類がまとまった1つのPDFを選択してください
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
}
