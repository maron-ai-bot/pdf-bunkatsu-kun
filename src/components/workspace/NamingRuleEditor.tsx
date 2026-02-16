import { useState } from 'react';
import { Tag, ChevronDown, ChevronUp } from 'lucide-react';
import type { AiSettings } from '../../types/index.ts';

interface NamingRuleEditorProps {
  settings: AiSettings;
  onUpdate: (updates: Partial<AiSettings>) => void;
}

export function NamingRuleEditor({ settings, onUpdate }: NamingRuleEditorProps) {
  const [isOpen, setIsOpen] = useState(false);

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
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
              settings.namingRule === 'custom'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {settings.namingRule === 'custom' ? 'カスタム' : '自動'}
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
          <div className="flex gap-2">
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
          </div>

          {settings.namingRule === 'custom' && (
            <textarea
              value={settings.customNamingPrompt}
              onChange={(e) => onUpdate({ customNamingPrompt: e.target.value })}
              placeholder="例: YYYYMMDD_書類名の形式で命名してください"
              rows={3}
              className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
            />
          )}
        </div>
      )}
    </div>
  );
}
