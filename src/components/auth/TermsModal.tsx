import { X, ExternalLink } from 'lucide-react';
import { TERMS_SECTIONS, CONTACT_FORM_URL } from './termsText';

interface TermsModalProps {
  onClose: () => void;
}

export function TermsModal({ onClose }: TermsModalProps) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl w-[560px] max-w-[95vw] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* ヘッダー */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold text-slate-800">利用規約</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* 規約本文（スクロール可能） */}
        <div className="flex-1 overflow-y-auto px-6 py-5 scrollbar-thin">
          <div className="space-y-5">
            {TERMS_SECTIONS.map((section, i) => (
              <div key={i}>
                <h3 className="text-sm font-bold text-slate-700 mb-1.5">{section.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-line">{section.content}</p>
                {i === TERMS_SECTIONS.length - 1 && (
                  <a
                    href={CONTACT_FORM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 mt-1.5 no-underline"
                  >
                    お問い合わせフォーム <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* フッター */}
        <div className="px-6 py-4 border-t border-slate-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-100 text-slate-600 font-bold rounded-xl
                       hover:bg-slate-200 transition-colors cursor-pointer"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
