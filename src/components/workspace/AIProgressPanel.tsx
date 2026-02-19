import { useEffect, useRef } from 'react';
import type { AnalysisStep, AnalysisLogEntry } from '../../types/index.ts';

interface AIProgressPanelProps {
  visible: boolean;
  currentPage: number;
  totalPages: number;
  step: AnalysisStep;
  percent: number;
  logs: AnalysisLogEntry[];
}

const STEPS: { key: AnalysisStep; label: string }[] = [
  { key: 'convert', label: '画像変換' },
  { key: 'send', label: 'API送信' },
  { key: 'parse', label: '結果解析' },
  { key: 'done', label: '完了' },
];

const STEP_LABELS: Record<AnalysisStep, string> = {
  convert: '画像変換中',
  send: 'API送信中',
  parse: '結果解析中',
  done: '完了',
};

const LOG_COLORS: Record<AnalysisLogEntry['type'], string> = {
  info: 'text-orange-400',
  success: 'text-green-400',
  error: 'text-red-400',
  step: 'text-sky-400',
};

export function AIProgressPanel({
  visible,
  currentPage,
  totalPages,
  step,
  percent,
  logs,
}: AIProgressPanelProps) {
  const logBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logBodyRef.current) {
      logBodyRef.current.scrollTop = logBodyRef.current.scrollHeight;
    }
  }, [logs]);

  if (!visible) return null;

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="mb-4 space-y-3">
      {/* Progress Panel */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 text-white shadow-lg">
        {/* Info */}
        <div className="flex justify-between items-center mb-2 text-sm">
          <span className="opacity-90">
            {step === 'done'
              ? '分析完了'
              : `ページ ${currentPage}/${totalPages} — ${STEP_LABELS[step]}`}
          </span>
          <span className="font-mono font-bold text-base">{percent}%</span>
        </div>

        {/* Progress bar */}
        <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden mb-3">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${percent}%`,
              background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #22c55e)',
            }}
          />
        </div>

        {/* Step indicator */}
        <div className="flex justify-between">
          {STEPS.map((s, i) => (
            <div
              key={s.key}
              className={`flex flex-col items-center gap-1 text-[10px] transition-all ${
                i < stepIndex
                  ? 'opacity-100'
                  : i === stepIndex
                  ? 'opacity-100'
                  : 'opacity-40'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < stepIndex
                    ? 'bg-green-500 text-white'
                    : i === stepIndex
                    ? 'bg-purple-500 text-white ring-2 ring-purple-400 ring-offset-1 ring-offset-slate-800'
                    : 'bg-slate-600 text-slate-400'
                }`}
              >
                {i < stepIndex ? '✓' : i + 1}
              </div>
              <span className={i === stepIndex ? 'text-purple-300 font-medium' : 'text-slate-400'}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Log Panel */}
      {logs.length > 0 && (
        <details className="group" open>
          <summary className="flex items-center justify-between bg-slate-800 text-slate-300 text-xs px-3 py-2 rounded-t-lg cursor-pointer select-none hover:bg-slate-700 transition-colors">
            <span>📋 AI分析ログ ({logs.length}件)</span>
            <span className="group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div
            ref={logBodyRef}
            className="bg-slate-900 rounded-b-lg max-h-40 overflow-y-auto p-2 space-y-0.5"
          >
            {logs.map((log, i) => (
              <div key={i} className={`text-[11px] font-mono ${LOG_COLORS[log.type]}`}>
                <span className="text-slate-500">[{log.timestamp}]</span>{' '}
                <span className="text-slate-400">{log.page ? `P${log.page}` : '全体'}</span>{' '}
                → {log.message}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
