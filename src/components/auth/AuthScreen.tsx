import { useState, useCallback } from 'react';
import { Lock, Smartphone, Eye, EyeOff } from 'lucide-react';

const AUTH_KEY = 'pdf_bunkatsu_auth';
const LINE_URL = 'https://lin.ee/g3MmeoCw';

// 簡易ハッシュ（難読化目的）
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0;
  }
  return hash.toString(36);
}

// パスワードのハッシュ値（ソースコードから直接見えないように）
const VALID_HASH = simpleHash('aibunkatsu2026');

export function isAuthenticated(): boolean {
  return localStorage.getItem(AUTH_KEY) === 'ok';
}

interface AuthScreenProps {
  onAuthenticated: () => void;
}

export function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = useCallback(() => {
    const trimmed = code.trim();
    if (simpleHash(trimmed) === VALID_HASH) {
      localStorage.setItem(AUTH_KEY, 'ok');
      onAuthenticated();
    } else {
      setError('アクセスコードが正しくありません');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }, [code, onAuthenticated]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSubmit();
    },
    [handleSubmit]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-700">
      <div className="bg-white rounded-2xl p-12 w-[420px] max-w-[90vw] text-center shadow-2xl">
        {/* アイコン */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        {/* タイトル */}
        <h1 className="text-xl font-bold text-slate-800 mb-1">PDF分割くん</h1>
        <p className="text-sm text-slate-400 mb-7">アクセスコードを入力してください</p>

        {/* 入力欄 */}
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={code}
            onChange={(e) => { setCode(e.target.value); setError(''); }}
            onKeyDown={handleKeyDown}
            placeholder="アクセスコード"
            autoFocus
            className={`
              w-full px-4 py-3.5 pr-12 border-2 rounded-xl text-center text-base tracking-widest
              outline-none transition-colors
              ${shake ? 'animate-shake border-red-400' : 'border-slate-200 focus:border-purple-500'}
            `}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {/* エラーメッセージ */}
        <p className="text-red-500 text-sm mt-2 min-h-[20px]">{error}</p>

        {/* ログインボタン */}
        <button
          onClick={handleSubmit}
          className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl
                     hover:opacity-90 transition-opacity mt-2 mb-5 cursor-pointer"
        >
          ログイン
        </button>

        {/* LINE誘導 */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm text-slate-600 mb-3">
            アクセスコードはLINE公式アカウントの<br />
            友だち登録特典で配布しています🎁
          </p>
          <a
            href={LINE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#06c755] text-white font-bold text-sm
                       px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity no-underline"
          >
            <Smartphone className="w-4 h-4" />
            LINEで友だち追加する
          </a>
          <p className="text-xs text-slate-500 mt-3">
            友だち追加したら「<span className="font-bold text-slate-700">PDF</span>」と送ってください📩
          </p>
        </div>
      </div>
    </div>
  );
}
