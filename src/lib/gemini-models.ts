import type { GeminiModel } from '../types/index.ts';

// PDF分割に使えるモデルの優先順位（上にあるものが上位）
const MODEL_PRIORITY: string[] = [
  'gemini-2.5-pro',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-pro',
  'gemini-3',
  'gemini-1.5-pro',
  'gemini-1.5-flash',
];

// 除外するモデル名のパターン（画像生成・TTS・embeddingなどPDF分割に不要）
const EXCLUDE_PATTERNS = [
  'image-generation',
  'tts',
  'preview-tts',
  'embedding',
  'aqa',
  'bisheng',
];

function getModelPriority(modelId: string): number {
  for (let i = 0; i < MODEL_PRIORITY.length; i++) {
    if (modelId.startsWith(MODEL_PRIORITY[i])) {
      return i;
    }
  }
  return MODEL_PRIORITY.length;
}

export async function fetchAvailableModels(apiKey: string): Promise<GeminiModel[]> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('モデル一覧の取得に失敗しました');
  const data = await res.json();

  const models: GeminiModel[] = data.models
    .filter(
      (m: { supportedGenerationMethods?: string[]; name: string }) =>
        m.supportedGenerationMethods?.includes('generateContent') &&
        m.name.includes('gemini') &&
        !EXCLUDE_PATTERNS.some((pat) => m.name.includes(pat))
    )
    .map((m: { name: string; displayName: string }) => ({
      id: m.name.replace('models/', ''),
      displayName: m.displayName,
    }));

  // 優先度順にソート（主要モデルが上に来る）
  models.sort((a, b) => {
    const priorityA = getModelPriority(a.id);
    const priorityB = getModelPriority(b.id);
    if (priorityA !== priorityB) return priorityA - priorityB;
    return a.id.localeCompare(b.id);
  });

  return models;
}
