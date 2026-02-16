import type { GeminiModel } from '../types/index.ts';

export async function fetchAvailableModels(apiKey: string): Promise<GeminiModel[]> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('モデル一覧の取得に失敗しました');
  const data = await res.json();

  return data.models
    .filter(
      (m: { supportedGenerationMethods?: string[]; name: string }) =>
        m.supportedGenerationMethods?.includes('generateContent') &&
        m.name.includes('gemini')
    )
    .map((m: { name: string; displayName: string }) => ({
      id: m.name.replace('models/', ''),
      displayName: m.displayName,
    }))
    .slice(0, 10);
}
