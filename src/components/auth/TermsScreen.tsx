import { Shield, ExternalLink } from 'lucide-react';
import { TERMS_KEY, TERMS_SECTIONS, CONTACT_FORM_URL } from './termsText';

interface TermsScreenProps {
  onAgreed: () => void;
}

export function isTermsAgreed(): boolean {
  return localStorage.getItem(TERMS_KEY) === 'yes';
}

export function TermsScreen({ onAgreed }: TermsScreenProps) {
  const handleAgree = () => {
    localStorage.setItem(TERMS_KEY, 'yes');
    onAgreed();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-700 p-4">
      <div className="bg-white rounded-2xl w-[560px] max-w-[95vw] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* ヘッダー */}
        <div className="px-8 pt-8 pb-4 text-center flex-shrink-0">
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
              <Shield className="w-7 h-7 text-purple-600" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-1">利用規約</h1>
          <p className="text-sm text-slate-400">ご利用前に必ずお読みください</p>
        </div>

        {/* 規約本文（スクロール可能） */}
        <div className="flex-1 overflow-y-auto px-8 pb-4 scrollbar-thin">
          <div className="space-y-5">
            {TERMS_SECTIONS.map((section, i) => (
              <div key={i}>
                <h3 className="text-sm font-bold text-slate-700 mb-1.5">{section.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-line">{section.content}</p>
                {/* 最後の条にお問い合わせリンク */}
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

        {/* 同意ボタン */}
        <div className="px-8 py-5 border-t border-slate-100 flex-shrink-0">
          <button
            onClick={handleAgree}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl
                       hover:opacity-90 transition-opacity cursor-pointer"
          >
            同意して利用を開始する
          </button>
          <p className="text-xs text-slate-400 text-center mt-2">
            ボタンを押すと、上記の利用規約に同意したものとみなされます
          </p>
        </div>
      </div>
    </div>
  );
}
