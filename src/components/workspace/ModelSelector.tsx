import { useState } from 'react';
import { Cpu, RefreshCw } from 'lucide-react';
import { fetchAvailableModels } from '../../lib/gemini-models.ts';
import type { GeminiModel } from '../../types/index.ts';

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  apiKey: string;
}

export function ModelSelector({ value, onChange, apiKey }: ModelSelectorProps) {
  const [models, setModels] = useState<GeminiModel[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [modelCount, setModelCount] = useState<number | null>(null);

  const handleRefresh = async () => {
    if (!apiKey) {
      alert('APIキーを先に入力してください');
      return;
    }
    setIsFetching(true);
    try {
      const fetched = await fetchAvailableModels(apiKey);
      setModels(fetched);
      setModelCount(fetched.length);
    } catch {
      alert('モデル一覧の取得に失敗しました');
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <Cpu className="w-3.5 h-3.5" />
          モデル
        </label>
        <button
          onClick={handleRefresh}
          disabled={isFetching}
          className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isFetching ? 'animate-spin' : ''}`} />
          再取得
        </button>
      </div>

      {models.length > 0 ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-sm bg-white border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer"
        >
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.id}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-sm bg-white border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      )}

      {modelCount !== null && (
        <p className="text-[11px] text-slate-400 mt-1">
          {modelCount}個のモデルが利用可能
        </p>
      )}
    </div>
  );
}
